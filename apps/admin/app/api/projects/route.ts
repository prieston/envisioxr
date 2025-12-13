import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isGodUser } from "@/lib/config/godusers";
import { NextRequest } from "next/server";

/**
 * GET: Search projects (admin only)
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email || !isGodUser(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get("search")?.trim() || "";

    const whereClause: any = {};

    // Add search filter if query is provided
    if (searchQuery) {
      whereClause.OR = [
        {
          title: {
            contains: searchQuery,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: searchQuery,
            mode: "insensitive",
          },
        },
      ];
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        description: true,
        thumbnail: true,
        publishedUrl: true,
        isPublished: true,
        organization: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20, // Limit results for performance
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("[Admin Projects API] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


