/**
 * GET /api/organizations/[orgId]/members
 * Get all members of an organization
 * PATCH /api/organizations/[orgId]/members
 * Update a member's role (owners only)
 * DELETE /api/organizations/[orgId]/members
 * Remove a member from an organization (owners only)
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { OrganizationRole } from "@prisma/client";

export async function GET(
  _request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { orgId } = params;

  try {
    // Verify user is a member of this organization
    const userMembership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: orgId,
          userId,
        },
      },
    });

    if (!userMembership) {
      return NextResponse.json(
        { error: "You are not a member of this organization" },
        { status: 403 }
      );
    }

    // Get organization with all members and their user info
    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        invites: {
          where: {
            expires: {
              gte: new Date(),
            },
          },
          include: {
            invitedBy: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      members: organization.members.map((member) => ({
        id: member.id,
        userId: member.userId,
        role: member.role,
        createdAt: member.createdAt.toISOString(),
        user: {
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          image: member.user.image,
        },
      })),
      invites: organization.invites.map((invite) => ({
        id: invite.id,
        email: invite.email,
        role: invite.role,
        expires: invite.expires.toISOString(),
        createdAt: invite.createdAt.toISOString(),
        invitedBy: invite.invitedBy.name || invite.invitedBy.email,
      })),
      userRole: userMembership.role,
    });
  } catch (error) {
    console.error("[Org Members API] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { orgId } = params;

  try {
    const body = await request.json();
    const { memberId, role } = body;

    if (!memberId) {
      return NextResponse.json(
        { error: "Member ID is required" },
        { status: 400 }
      );
    }

    if (!role) {
      return NextResponse.json(
        { error: "Role is required" },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles: OrganizationRole[] = ["owner", "admin", "member", "publicViewer"];
    if (!validRoles.includes(role as OrganizationRole)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    // Verify user is owner of this organization
    const userMembership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: orgId,
          userId,
        },
      },
    });

    if (!userMembership || userMembership.role !== "owner") {
      return NextResponse.json(
        { error: "Only owners can update member roles" },
        { status: 403 }
      );
    }

    // Get the member to update
    const memberToUpdate = await prisma.organizationMember.findUnique({
      where: { id: memberId },
      include: {
        organization: true,
      },
    });

    if (!memberToUpdate) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }

    if (memberToUpdate.organizationId !== orgId) {
      return NextResponse.json(
        { error: "Member does not belong to this organization" },
        { status: 400 }
      );
    }

    // Prevent changing your own role
    if (memberToUpdate.userId === userId) {
      return NextResponse.json(
        { error: "You cannot change your own role" },
        { status: 400 }
      );
    }

    // Prevent removing the last owner
    if (memberToUpdate.role === "owner" && role !== "owner") {
      const ownerCount = await prisma.organizationMember.count({
        where: {
          organizationId: orgId,
          role: "owner",
        },
      });

      if (ownerCount <= 1) {
        return NextResponse.json(
          { error: "Cannot change the last owner's role" },
          { status: 400 }
        );
      }
    }

    // Update the member's role
    const updated = await prisma.organizationMember.update({
      where: { id: memberId },
      data: {
        role: role as OrganizationRole,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Member role updated successfully",
      member: {
        id: updated.id,
        userId: updated.userId,
        role: updated.role,
        createdAt: updated.createdAt.toISOString(),
        user: updated.user,
      },
    });
  } catch (error) {
    console.error("[Org Members API] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { orgId } = params;

  try {
    const body = await request.json();
    const { memberId } = body;

    if (!memberId) {
      return NextResponse.json(
        { error: "Member ID is required" },
        { status: 400 }
      );
    }

    // Verify user is owner of this organization
    const userMembership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: orgId,
          userId,
        },
      },
    });

    if (!userMembership || userMembership.role !== "owner") {
      return NextResponse.json(
        { error: "Only owners can remove members" },
        { status: 403 }
      );
    }

    // Get the member to remove
    const memberToRemove = await prisma.organizationMember.findUnique({
      where: { id: memberId },
      include: {
        organization: true,
      },
    });

    if (!memberToRemove) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }

    if (memberToRemove.organizationId !== orgId) {
      return NextResponse.json(
        { error: "Member does not belong to this organization" },
        { status: 400 }
      );
    }

    // Prevent removing the last owner
    if (memberToRemove.role === "owner") {
      const ownerCount = await prisma.organizationMember.count({
        where: {
          organizationId: orgId,
          role: "owner",
        },
      });

      if (ownerCount <= 1) {
        return NextResponse.json(
          { error: "Cannot remove the last owner" },
          { status: 400 }
        );
      }
    }

    // Prevent removing yourself
    if (memberToRemove.userId === userId) {
      return NextResponse.json(
        { error: "You cannot remove yourself" },
        { status: 400 }
      );
    }

    // Remove the member
    await prisma.organizationMember.delete({
      where: { id: memberId },
    });

    return NextResponse.json({
      message: "Member removed successfully",
    });
  } catch (error) {
    console.error("[Org Members API] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

