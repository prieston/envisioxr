import prisma from "@/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/authOptions";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Hard-coded stock models.
const stockModels = [
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

// Disable the default body parser.
export const config = {
  api: {
    bodyParser: false,
  },
};

// GET: List both stock models and user's uploaded assets.
export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: Generate a signed URL for uploading a file to DigitalOcean Spaces.
export async function PATCH(request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { fileName, fileType } = await request.json();
    if (!fileName || !fileType) {
      return NextResponse.json({ error: "Missing file data" }, { status: 400 });
    }
    // Configure the S3 client for DigitalOcean Spaces.
    const s3 = new S3Client({
      region: process.env.DO_SPACES_REGION,
      endpoint: process.env.DO_SPACES_ENDPOINT, // e.g. "https://fra1.digitaloceanspaces.com"
      credentials: {
        accessKeyId: process.env.DO_SPACES_KEY,
        secretAccessKey: process.env.DO_SPACES_SECRET,
      },
    });
    const bucketName = process.env.DO_SPACES_BUCKET;
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Create a new Asset record once the file has been uploaded.
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  try {
    // Expecting a JSON body with key, originalFilename, and fileType.
    const body = await request.json();
    const { key, originalFilename, fileType } = body;
    if (!key || !originalFilename || !fileType) {
      return NextResponse.json({ error: "Missing file data" }, { status: 400 });
    }
    // Construct the public file URL from your DigitalOcean Spaces bucket.
    const fileUrl = `${process.env.DO_SPACES_ENDPOINT}/${process.env.DO_SPACES_BUCKET}/${key}`;
    const asset = await prisma.asset.create({
      data: {
        userId,
        fileUrl,
        originalFilename,
        fileType,
      },
    });
    return NextResponse.json({ asset });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Remove an asset from DigitalOcean Spaces and the database.
export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
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
    const bucketName = process.env.DO_SPACES_BUCKET;
    const endpoint = process.env.DO_SPACES_ENDPOINT;
    const fileUrl = asset.fileUrl;
    const key = fileUrl.replace(`${endpoint}/${bucketName}/`, "");
    // Setup S3 client.
    const s3 = new S3Client({
      region: process.env.DO_SPACES_REGION,
      endpoint: endpoint,
      credentials: {
        accessKeyId: process.env.DO_SPACES_KEY,
        secretAccessKey: process.env.DO_SPACES_SECRET,
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
