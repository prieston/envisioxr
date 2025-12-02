import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { isGodUser } from "@/lib/config/godusers";

/**
 * GET: Get lightweight user list for admin operations (e.g., adding members)
 * This endpoint only returns essential user data without expensive stats calculations.
 * Use /api/stats for full statistics.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isGodUser(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // [ADMIN_PRISMA] Lightweight query - only fetch essential user fields
    // No counts or aggregations to keep this fast and connection-efficient
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { id: "desc" },
    });

    return NextResponse.json({
      users: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
      })),
    });
  } catch (error) {
    console.error("[Admin Users API] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

