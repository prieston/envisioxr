import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserDefaultOrganization } from "@/lib/organizations";

// GET: Get current user's information
export async function GET(_request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    console.error("[User API] No session or user ID:", {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get user's default organization
    const organization = await getUserDefaultOrganization(userId);

    // Get user's role in the organization
    let userRole = null;
    if (organization) {
      const member = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: organization.id,
            userId,
          },
        },
      });
      userRole = member?.role || null;
    }

    // Get user's account providers (OAuth providers)
    const accounts = await prisma.account.findMany({
      where: { userId },
      select: {
        provider: true,
        type: true,
      },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        organization: organization
          ? {
              id: organization.id,
              name: organization.name,
              slug: organization.slug,
              isPersonal: organization.isPersonal,
              userRole,
            }
          : null,
        accounts: accounts.map((acc) => ({
          provider: acc.provider,
          type: acc.type,
        })),
      },
    });
  } catch (error) {
    console.error("[User API] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

