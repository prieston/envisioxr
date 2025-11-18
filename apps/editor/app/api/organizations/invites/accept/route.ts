/**
 * POST /api/organizations/invites/accept
 * Accept an organization invitation
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: "Invitation token is required" },
        { status: 400 }
      );
    }

    // Find invitation
    const invite = await prisma.organizationInvite.findUnique({
      where: { token },
      include: {
        organization: true,
      },
    });

    if (!invite) {
      return NextResponse.json(
        { error: "Invalid invitation token" },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (invite.expires < new Date()) {
      return NextResponse.json(
        { error: "Invitation token has expired" },
        { status: 400 }
      );
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        organizationMembers: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify email matches (if user has email)
    if (user.email && user.email.toLowerCase() !== invite.email.toLowerCase()) {
      return NextResponse.json(
        { error: "This invitation was sent to a different email address" },
        { status: 403 }
      );
    }

    // Check if already a member
    const existingMember = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: invite.organizationId,
          userId,
        },
      },
    });

    if (existingMember) {
      // Delete invitation since user is already a member
      await prisma.organizationInvite.delete({
        where: { id: invite.id },
      });
      return NextResponse.json({
        message: "You are already a member of this organization",
        organizationId: invite.organizationId,
      });
    }

    // Create organization membership
    await prisma.organizationMember.create({
      data: {
        organizationId: invite.organizationId,
        userId,
        role: invite.role,
      },
    });

    // Delete invitation
    await prisma.organizationInvite.delete({
      where: { id: invite.id },
    });

    // Check if this is user's first organization (excluding personal orgs)
    const orgCount = await prisma.organizationMember.count({
      where: {
        userId,
        organization: {
          isPersonal: false,
        },
      },
    });

    // If this is their first non-personal org, send welcome email
    if (orgCount === 1 && user.email) {
      sendWelcomeEmail(
        user.email,
        invite.organization.name,
        user.name || undefined,
        invite.organizationId
      ).catch((error) => {
        // TODO: Integrate with centralized logging/observability system (e.g., Sentry)
        console.error("[Accept Invite] Failed to send welcome email:", error);
      });
    }

    return NextResponse.json({
      message: "Invitation accepted successfully",
      organizationId: invite.organizationId,
    });
  } catch (error) {
    console.error("[Accept Invite] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

