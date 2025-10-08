import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest } from "next/server";
import { Session } from "next-auth";
import { serverEnv } from "@/lib/env/server";

export async function POST(request: NextRequest) {
  const session = (await getServerSession(authOptions)) as Session;
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const fileName = formData.get("fileName") as string;
    const fileType = formData.get("fileType") as string;
    const bucketName = formData.get("bucketName") as string;

    // Log what we received for debugging
    console.log("Received upload request:", {
      hasFile: !!file,
      fileName,
      fileType,
      bucketName,
    });

    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    if (!fileName) {
      return NextResponse.json({ error: "Missing fileName" }, { status: 400 });
    }

    if (!fileType) {
      return NextResponse.json({ error: "Missing fileType" }, { status: 400 });
    }

    if (!bucketName) {
      return NextResponse.json(
        { error: "Missing bucketName - check NEXT_PUBLIC_S3_BUCKET env var" },
        { status: 400 }
      );
    }

    // Configure the S3 client for DigitalOcean Spaces
    const s3 = new S3Client({
      region: serverEnv.DO_SPACES_REGION,
      endpoint: serverEnv.DO_SPACES_ENDPOINT,
      credentials: {
        accessKeyId: serverEnv.DO_SPACES_KEY,
        secretAccessKey: serverEnv.DO_SPACES_SECRET,
      },
    });

    // Generate unique key
    const key = `models/${Date.now()}-${fileName}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: fileType,
      ACL: "public-read",
    });

    await s3.send(command);

    // Construct the public file URL
    const url = `${serverEnv.DO_SPACES_ENDPOINT}/${bucketName}/${key}`;

    return NextResponse.json({ url, key });
  } catch (error) {
    console.error("S3 upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
