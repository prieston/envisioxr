import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { Session } from "next-auth";
import { prisma } from "@/lib/prisma";
import { getUserOrganizationIds } from "@/lib/organizations";

// GET /api/models/types - Get available asset types for filtering
export async function GET(request: NextRequest) {
  const session = (await getServerSession(authOptions)) as Session;
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");
    const assetType = searchParams.get("assetType"); // "cesiumIonAsset" for geospatial

    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId is required" },
        { status: 400 }
      );
    }

    // Verify user is a member of the specified organization
    const userOrgIds = await getUserOrganizationIds(userId);
    if (!userOrgIds.includes(organizationId)) {
      return NextResponse.json(
        { error: "User is not a member of the specified organization" },
        { status: 403 }
      );
    }

    if (assetType === "cesiumIonAsset") {
      // Get unique fileType values from cesiumIonAsset assets
      const assets = await prisma.asset.findMany({
        where: {
          organizationId,
          assetType: "cesiumIonAsset",
          fileType: { not: null },
        },
        select: {
          fileType: true,
        },
        distinct: ["fileType"],
      });

      // Map Cesium Ion types to user-friendly names
      const typeMap: Record<string, string> = {
        IMAGERY: "Imagery",
        TERRAIN: "Terrain",
        "3DTILES": "3D Tiles",
        GLTF: "glTF Model",
        CZML: "CZML",
        KML: "KML",
        GEOJSON: "GeoJSON",
      };

      const types = assets
        .map((a) => a.fileType)
        .filter((t): t is string => t !== null)
        .map((type) => ({
          value: type,
          label: typeMap[type] || type,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));

      return NextResponse.json({ types });
    }

    return NextResponse.json({ types: [] });
  } catch (error) {
    console.error("Error fetching asset types:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

