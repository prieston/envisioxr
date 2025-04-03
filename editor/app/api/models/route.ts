import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma.ts";
import { Session } from "next-auth";
import { doSpaces } from "@/lib/env";

interface StockModel {
  name: string;
  url: string;
  type: string;
}

// Hard-coded stock models.
const stockModels: StockModel[] = [
  {
    name: "House",
    url: "https://prieston-prod.fra1.cdn.digitaloceanspaces.com/general/house.glb",
    type: "glb",
  },
  {
    name: "CNC",
    url: "https://prieston-prod.fra1.cdn.digitaloceanspaces.com/general/cnc.glb",
    type: "glb",
  },
];

// GET: List both stock models and user's uploaded assets.
export async function GET(_request: NextRequest) {
  const session = (await getServerSession(authOptions)) as Session;
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  try {
    const assets = await prisma.asset.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ stockModels, assets });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// PATCH: Generate a signed URL for uploading a file to DigitalOcean Spaces.
export async function PATCH(request: NextRequest) {
  const session = (await getServerSession(authOptions)) as Session;
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { fileName, fileType } = await request.json();
    if (!fileName || !fileType) {
      return NextResponse.json({ error: "Missing file data" }, { status: 400 });
    }
    // Configure the S3 client for DigitalOcean Spaces.
    const s3 = new S3Client({
      region: doSpaces.region,
      endpoint: doSpaces.endpoint,
      credentials: {
        accessKeyId: doSpaces.key,
        secretAccessKey: doSpaces.secret,
      },
    });
    const bucketName = doSpaces.bucket;
    const key = `models/${Date.now()}-${fileName}`;
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: fileType,
      ACL: "public-read",
    });
    // Generate a signed URL valid for 1 hour.
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    return NextResponse.json({ signedUrl, key });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// POST: Create a new Asset record once the file has been uploaded.
export async function POST(request: NextRequest) {
  const session = (await getServerSession(authOptions)) as Session;
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  try {
    // Expecting a JSON body with key, originalFilename, fileType, and thumbnail.
    const body = await request.json();
    const { key, originalFilename, fileType, thumbnail } = body;
    if (!key || !originalFilename || !fileType) {
      return NextResponse.json({ error: "Missing file data" }, { status: 400 });
    }
    // Construct the public file URL from your DigitalOcean Spaces bucket.
    const fileUrl = `${doSpaces.endpoint}/${doSpaces.bucket}/${key}`;
    const asset = await prisma.asset.create({
      data: {
        userId,
        fileUrl,
        originalFilename,
        fileType,
        thumbnail: thumbnail || null,
      },
    });
    return NextResponse.json({ asset });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// DELETE: Remove an asset from DigitalOcean Spaces and the database.
export async function DELETE(request: NextRequest) {
  const session = (await getServerSession(authOptions)) as Session;
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  try {
    // Expecting a JSON body with assetId.
    const { assetId } = await request.json();
    if (!assetId) {
      return NextResponse.json({ error: "Asset ID missing" }, { status: 400 });
    }
    // Retrieve asset from database.
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
    });
    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }
    if (asset.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    // Determine the key from the asset's fileUrl.
    const bucketName = doSpaces.bucket;
    const endpoint = doSpaces.endpoint;
    const fileUrl = asset.fileUrl;
    const key = fileUrl.replace(`${endpoint}/${bucketName}/`, "");
    // Setup S3 client.
    const s3 = new S3Client({
      region: doSpaces.region,
      endpoint: endpoint,
      credentials: {
        accessKeyId: doSpaces.key,
        secretAccessKey: doSpaces.secret,
      },
    });
    // Delete the object from Spaces.
    const deleteCommand = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    await s3.send(deleteCommand);
    // Delete the asset record from the database.
    await prisma.asset.delete({
      where: { id: assetId },
    });
    return NextResponse.json({ message: "Asset deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
