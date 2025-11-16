import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Session } from "next-auth";
import { isUserMemberOfOrganization } from "@/lib/organizations";

// PATCH: Update asset (name, description, metadata, thumbnail)
export async function PATCH(request: NextRequest) {
  const session = (await getServerSession(authOptions)) as Session;
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const { assetId, name, description, metadata, thumbnail } =
      await request.json();

    if (!assetId) {
      return NextResponse.json(
        { error: "Asset ID is required" },
        { status: 400 }
      );
    }

    // Verify the asset exists and user is a member of the organization
    const existingAsset = await prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!existingAsset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    const isMember = await isUserMemberOfOrganization(
      userId,
      existingAsset.organizationId
    );
    if (!isMember) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Build update data object (only include fields that were provided)
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (metadata !== undefined) updateData.metadata = metadata;
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;

    // Update the asset
    const updatedAsset = await prisma.asset.update({
      where: { id: assetId },
      data: updateData,
    });

    return NextResponse.json({ asset: updatedAsset });
  } catch (error) {
    console.error("Asset update error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
