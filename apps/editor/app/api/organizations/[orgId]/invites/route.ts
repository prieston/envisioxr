/**
 * POST /api/organizations/[orgId]/invites
 * Invite a user to join an organization
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { OrganizationRole } from "@prisma/client";
import { generateToken, getTokenExpiration } from "@/lib/email/tokens";
import { sendOrgInviteEmail } from "@/lib/email";

export async function POST(
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
    const { email, role = "member" } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Validate role
    const validRoles = ["owner", "admin", "member", "publicViewer"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Verify organization exists and user is admin/owner
    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        members: {
          where: { userId },
        },
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    const membership = organization.members[0];
    if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
      return NextResponse.json(
        { error: "Only owners and admins can invite members" },
        { status: 403 }
      );
    }

    // Check if user exists by email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Check if already a member
      const isMember = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: orgId,
            userId: existingUser.id,
          },
        },
      });

      if (isMember) {
        return NextResponse.json(
          { error: "User is already a member of this organization" },
          { status: 409 }
        );
      }
    }

    // Check if there's already a pending invitation
    const existingInvite = await prisma.organizationInvite.findUnique({
      where: {
        organizationId_email: {
          organizationId: orgId,
          email,
        },
      },
    });

    if (existingInvite && existingInvite.expires > new Date()) {
      return NextResponse.json(
        { error: "Invitation already sent to this email" },
        { status: 409 }
      );
    }

    // Get inviter info
    const inviter = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!inviter) {
      return NextResponse.json({ error: "Inviter not found" }, { status: 404 });
    }

    // Generate invitation token
    const token = generateToken();
    const expires = getTokenExpiration(7 * 24); // 7 days

    // Create or update invitation
    await prisma.organizationInvite.upsert({
      where: {
        organizationId_email: {
          organizationId: orgId,
          email,
        },
      },
      create: {
        organizationId: orgId,
        email,
        role: role as OrganizationRole,
        token,
        expires,
        invitedById: userId,
      },
      update: {
        token,
        expires,
        invitedById: userId,
      },
    });

    // Send invitation email (don't await - don't block response)
    sendOrgInviteEmail(
      email,
      organization.name,
      inviter.name || inviter.email || "Someone",
      token
    ).catch((error) => {
      // TODO: Integrate with centralized logging/observability system (e.g., Sentry)
      console.error("[Org Invite] Failed to send invitation email:", error);
    });

    return NextResponse.json({
      message: "Invitation sent successfully",
    });
  } catch (error) {
    console.error("[Org Invite] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

