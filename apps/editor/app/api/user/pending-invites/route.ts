import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET: Check if user has any pending organization invitations
 */
export async function GET(_request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userEmail = session.user.email.toLowerCase();

    // Find all pending invitations for this user's email
    const pendingInvites = await prisma.organizationInvite.findMany({
      where: {
        email: userEmail,
        expires: {
          gt: new Date(), // Only non-expired invitations
        },
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      hasPendingInvites: pendingInvites.length > 0,
      count: pendingInvites.length,
      invites: pendingInvites.map((invite) => ({
        id: invite.id,
        organizationId: invite.organizationId,
        organizationName: invite.organization.name,
        role: invite.role,
        expires: invite.expires,
      })),
    });
  } catch (error) {
    console.error("[Pending Invites API] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

