import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Session } from "next-auth";
import { isUserMemberOfOrganization } from "@/lib/organizations";

/**
 * PUT /api/models/[assetId]/transform
 * Update the transform for a Cesium Ion asset in our database.
 * The transform is applied client-side when loading tilesets.
 */
export async function PUT(request: NextRequest, props: { params: Promise<{ assetId: string }> }) {
  const params = await props.params;
  try {
    const session = (await auth()) as Session | null;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { assetId } = params;
    const body = await request.json();
    const { transform, longitude, latitude, height } = body;

    if (!transform || !Array.isArray(transform) || transform.length !== 16) {
      return NextResponse.json(
        { error: "Transform must be an array of 16 numbers" },
        { status: 400 }
      );
    }

    // Fetch the asset
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      select: {
        id: true,
        organizationId: true,
        cesiumAssetId: true,
        cesiumApiKey: true,
        metadata: true,
      },
    });

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    // Verify user has access to this organization
    const isMember = await isUserMemberOfOrganization(
      session.user.id,
      asset.organizationId
    );
    if (!isMember) {
      return NextResponse.json(
        { error: "Access denied to this asset" },
        { status: 403 }
      );
    }

    // Update metadata in our database
    // Note: We store the transform locally and apply it when loading tilesets.
    // Cesium Ion's transform endpoint doesn't support PUT, so we manage transforms
    // entirely within Klorad's database and apply them client-side.
    const currentMetadata = (asset.metadata || {}) as Record<string, unknown>;

    const transformData = {
      matrix: transform,
      longitude,
      latitude,
      height,
    };

    const updatedAsset = await prisma.asset.update({
      where: { id: assetId },
      data: {
        metadata: {
          ...currentMetadata,
          transform: transformData,
        },
      },
    });

    // Convert BigInt fileSize and thumbnailSize to number for JSON serialization
    const serializedAsset = {
      ...updatedAsset,
      fileSize: updatedAsset.fileSize ? Number(updatedAsset.fileSize) : null,
      thumbnailSize: updatedAsset.thumbnailSize ? Number(updatedAsset.thumbnailSize) : null,
    };

    return NextResponse.json({
      success: true,
      asset: serializedAsset,
    });
  } catch (error) {
    console.error("Error updating transform:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update transform";
    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
