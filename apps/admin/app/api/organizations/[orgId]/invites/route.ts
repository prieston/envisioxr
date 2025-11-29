import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { isGodUser } from "@/lib/config/godusers";
import { OrganizationRole } from "@prisma/client";
import crypto from "crypto";
import { sendOrgInviteEmail } from "@/lib/email/helpers";

interface RouteParams {
  params: Promise<{ orgId: string }>;
}

/**
 * Generate a secure random token for invitations
 */
function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Get token expiration date (7 days from now)
 */
function getTokenExpiration(hours: number): Date {
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + hours);
  return expiration;
}

/**
 * POST: Invite a user to join an organization (admin only)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isGodUser(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const userId = session.user.id;
  const { orgId } = await params;

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

    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Personal organizations cannot have multiple members
    if (organization.isPersonal) {
      return NextResponse.json(
        { error: "Personal organizations cannot invite members" },
        { status: 400 }
      );
    }

    // Check if user with this email already exists and is a member
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: {
        organizationMembers: {
          where: { organizationId: orgId },
        },
      },
    });

    if (existingUser && existingUser.organizationMembers.length > 0) {
      return NextResponse.json(
        { error: "User is already a member of this organization" },
        { status: 400 }
      );
    }

    // Get inviter info
    const inviter = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    if (!inviter) {
      return NextResponse.json({ error: "Inviter not found" }, { status: 404 });
    }

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
        role: role as OrganizationRole,
      },
    });

    // Send invitation email (don't await - don't block response)
    sendOrgInviteEmail(
      email,
      organization.name,
      inviter.name || inviter.email || "Admin",
      token
    ).catch((error) => {
      console.error("[Admin Invite] Failed to send invitation email:", error);
    });

    return NextResponse.json({
      message: "Invitation created and email sent successfully",
    });
  } catch (error) {
    console.error("[Admin Invites API] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Cancel/revoke an invitation (admin only)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isGodUser(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { orgId } = await params;

  try {
    const body = await request.json();
    const { inviteId } = body;

    if (!inviteId) {
      return NextResponse.json(
        { error: "Invite ID is required" },
        { status: 400 }
      );
    }

    const invite = await prisma.organizationInvite.findUnique({
      where: { id: inviteId },
    });

    if (!invite) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    if (invite.organizationId !== orgId) {
      return NextResponse.json(
        { error: "Invitation does not belong to this organization" },
        { status: 400 }
      );
    }

    await prisma.organizationInvite.delete({
      where: { id: inviteId },
    });

    return NextResponse.json({
      message: "Invitation revoked successfully",
    });
  } catch (error) {
    console.error("[Admin Invites API] Error revoking invitation:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

