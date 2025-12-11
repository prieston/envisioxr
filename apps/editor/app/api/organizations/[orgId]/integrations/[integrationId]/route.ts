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

// PATCH: Update a Cesium Ion integration
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const { orgId, integrationId } = await params;

  try {
    const body = await request.json();
    const { name, readOnlyToken, uploadToken } = body;

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

    // Build update data
    const updateData: {
      name?: string;
      readOnlyToken?: string;
      uploadToken?: string;
    } = {};

    if (name !== undefined) {
      if (!name || name.trim().length === 0) {
        return NextResponse.json(
          { error: "Integration name cannot be empty" },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    if (readOnlyToken !== undefined) {
      if (!readOnlyToken || readOnlyToken.trim().length === 0) {
        return NextResponse.json(
          { error: "Read-only token cannot be empty" },
          { status: 400 }
        );
      }
      updateData.readOnlyToken = readOnlyToken.trim();
    }

    if (uploadToken !== undefined) {
      if (!uploadToken || uploadToken.trim().length === 0) {
        return NextResponse.json(
          { error: "Upload token cannot be empty" },
          { status: 400 }
        );
      }
      updateData.uploadToken = uploadToken.trim();
    }

    // Update integration
    const integration = await prisma.cesiumIonIntegration.update({
      where: { id: integrationId },
      data: updateData,
    });

    return NextResponse.json({ integration });
  } catch (error) {
    console.error("[Integrations API] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

// DELETE: Delete a Cesium Ion integration
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

    // Delete integration
    await prisma.cesiumIonIntegration.delete({
      where: { id: integrationId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Integrations API] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

