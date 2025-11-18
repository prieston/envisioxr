import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { Session } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { isUserMemberOfOrganization, hasUserRoleInOrganization } from "@/lib/organizations";

interface RouteParams {
  params: {
    orgId: string;
  };
}

// GET: Get organization by ID
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

    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Get user's role in the organization
    const member = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: orgId,
          userId,
        },
      },
    });

    return NextResponse.json({
      organization: {
        ...organization,
        userRole: member?.role || null,
      },
    });
  } catch (error) {
    console.error("[Organizations API] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

// PATCH: Update organization
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = (await getServerSession(authOptions)) as Session;
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const { orgId } = await params;

  try {
    const body = await request.json();
    const { name, slug } = body;

    // Verify user is a member of this organization
    const isMember = await isUserMemberOfOrganization(userId, orgId);
    if (!isMember) {
      return NextResponse.json(
        { error: "User is not a member of this organization" },
        { status: 403 }
      );
    }

    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
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
    if (name !== undefined && (!name || name.trim().length === 0)) {
      return NextResponse.json(
        { error: "Organization name is required" },
        { status: 400 }
      );
    }

    // If slug is being changed, check uniqueness
    if (slug !== undefined && slug !== organization.slug) {
      if (!slug || slug.trim().length === 0) {
        return NextResponse.json(
          { error: "Organization slug is required" },
          { status: 400 }
        );
      }

      // Validate slug format (alphanumeric, hyphens, underscores)
      const slugRegex = /^[a-z0-9-_]+$/;
      if (!slugRegex.test(slug.toLowerCase())) {
        return NextResponse.json(
          {
            error:
              "Slug can only contain lowercase letters, numbers, hyphens, and underscores",
          },
          { status: 400 }
        );
      }

      // Check if slug is already taken
      const existingOrg = await prisma.organization.findUnique({
        where: { slug: slug.toLowerCase() },
      });

      if (existingOrg && existingOrg.id !== organization.id) {
        return NextResponse.json(
          { error: "Slug is already taken" },
          { status: 400 }
        );
      }
    }

    // Update organization
    const updatedOrganization = await prisma.organization.update({
      where: { id: orgId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(slug !== undefined && { slug: slug.toLowerCase().trim() }),
      },
    });

    return NextResponse.json({ organization: updatedOrganization });
  } catch (error) {
    console.error("[Organizations API] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

