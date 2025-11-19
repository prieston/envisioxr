import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import {
  isUserMemberOfOrganization,
  hasUserRoleInOrganization,
} from "@/lib/organizations";
import { syncCesiumAssets } from "@/lib/cesium/sync";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: { orgId: string; integrationId: string };
}

/**
 * POST: Sync Cesium Ion assets for an integration
 */
export async function POST(
  _request: NextRequest,
  { params }: RouteParams
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const { orgId, integrationId } = await params;

  try {
    // Verify user is a member of this organization
    const isMember = await isUserMemberOfOrganization(userId, orgId);
    if (!isMember) {
      return NextResponse.json(
        { error: "User is not a member of this organization" },
        { status: 403 }
      );
    }

    // Check if user has admin or owner role
    const canEdit =
      (await hasUserRoleInOrganization(userId, orgId, "admin")) ||
      (await hasUserRoleInOrganization(userId, orgId, "owner"));

    if (!canEdit) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Verify integration exists and belongs to organization
    const integration = await prisma.cesiumIonIntegration.findFirst({
      where: {
        id: integrationId,
        organizationId: orgId,
      },
    });

    if (!integration) {
      return NextResponse.json(
        { error: "Integration not found" },
        { status: 404 }
      );
    }

    if (!integration.readTokenValid) {
      return NextResponse.json(
        { error: "Read token is not valid. Please update the integration." },
        { status: 400 }
      );
    }

    // Perform sync
    const syncResult = await syncCesiumAssets(integrationId, orgId);

    return NextResponse.json({
      success: true,
      ...syncResult,
    });
  } catch (error) {
    console.error("[Cesium Sync API] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

