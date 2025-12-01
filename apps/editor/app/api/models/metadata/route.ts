import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Session } from "next-auth";
import { isUserMemberOfOrganization } from "@/lib/organizations";
import { logActivity } from "@/lib/activity";

// PATCH: Update asset (name, description, metadata, thumbnail)
export async function PATCH(request: NextRequest) {
  const session = (await getServerSession(authOptions)) as Session;
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const { assetId, name, description, metadata, thumbnail, thumbnailSize } =
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
    if (thumbnail !== undefined) {
      updateData.thumbnail = thumbnail;
      // If thumbnail is being set, also update thumbnailSize if provided
      if (thumbnailSize !== undefined) {
        updateData.thumbnailSize = thumbnailSize ? BigInt(thumbnailSize) : null;
      } else if (thumbnail === null) {
        // If thumbnail is being removed, also remove thumbnailSize
        updateData.thumbnailSize = null;
      }
    }

    // Update the asset
    const updatedAsset = await prisma.asset.update({
      where: { id: assetId },
      data: updateData,
    });

    // Log activity
    const entityType =
      existingAsset.assetType === "cesiumIonAsset"
        ? "GEOSPATIAL_ASSET"
        : "MODEL";
    await logActivity({
      organizationId: existingAsset.organizationId,
      projectId: existingAsset.projectId || null,
      actorId: userId,
      entityType,
      entityId: assetId,
      action: "UPDATED",
      message: `Asset "${updatedAsset.name || updatedAsset.originalFilename}" updated`,
      metadata: {
        assetName: updatedAsset.name || updatedAsset.originalFilename,
        changedFields: Object.keys(updateData),
      },
    });

    // Convert BigInt fileSize and thumbnailSize to number for JSON serialization
    const serializedAsset = {
      ...updatedAsset,
      fileSize: updatedAsset.fileSize ? Number(updatedAsset.fileSize) : null,
      thumbnailSize: updatedAsset.thumbnailSize ? Number(updatedAsset.thumbnailSize) : null,
    };
    return NextResponse.json({ asset: serializedAsset });
  } catch (error) {
    console.error("Asset update error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
