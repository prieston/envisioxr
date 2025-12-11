import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  isUserMemberOfOrganization,
  hasUserRoleInOrganization,
} from "@/lib/organizations";

interface RouteParams {
  params: Promise<{ orgId: string; integrationId: string }>;
}

/**
 * DELETE: Delete a Cesium Ion integration
 */
export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
) {
  const session = await auth();
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
    const existingIntegration =
      await prisma.cesiumIonIntegration.findFirst({
        where: {
          id: integrationId,
          organizationId: orgId,
        },
      });

    if (!existingIntegration) {
      return NextResponse.json(
        { error: "Integration not found" },
        { status: 404 }
      );
    }

    // Delete integration (cascade will delete associated cesiumAssets)
    await prisma.cesiumIonIntegration.delete({
      where: { id: integrationId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Cesium Integrations API] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

