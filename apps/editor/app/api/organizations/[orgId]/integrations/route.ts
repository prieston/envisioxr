import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import {
  isUserMemberOfOrganization,
  hasUserRoleInOrganization,
} from "@/lib/organizations";

interface RouteParams {
  params: { orgId: string };
}

// GET: Get all Cesium Ion integrations for an organization
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const { orgId } = await params;

  try {
    // Verify user is a member of this organization
    const isMember = await isUserMemberOfOrganization(userId, orgId);
    if (!isMember) {
      return NextResponse.json(
        { error: "User is not a member of this organization" },
        { status: 403 }
      );
    }

    const integrations = await prisma.cesiumIonIntegration.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ integrations });
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

// POST: Create a new Cesium Ion integration
export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const { orgId } = await params;

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

    // Validate inputs
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Integration name is required" },
        { status: 400 }
      );
    }

    if (!readOnlyToken || readOnlyToken.trim().length === 0) {
      return NextResponse.json(
        { error: "Read-only token is required" },
        { status: 400 }
      );
    }

    if (!uploadToken || uploadToken.trim().length === 0) {
      return NextResponse.json(
        { error: "Upload token is required" },
        { status: 400 }
      );
    }

    // Create integration
    const integration = await prisma.cesiumIonIntegration.create({
      data: {
        organizationId: orgId,
        label: name.trim(),
        readToken: readOnlyToken.trim(),
        uploadToken: uploadToken.trim(),
        readTokenLast4: readOnlyToken.trim().slice(-4),
        uploadTokenLast4: uploadToken.trim().slice(-4),
      },
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
