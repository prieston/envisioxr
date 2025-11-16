import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Session } from "next-auth";
import { getUserOrganizationIds } from "@/lib/organizations";

export async function GET(request: NextRequest) {
  const session = (await getServerSession(authOptions)) as Session;
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const organizationId = searchParams.get("organizationId");
    const projectId = searchParams.get("projectId");
    const entityType = searchParams.get("entityType");
    const entityId = searchParams.get("entityId");

    // Get all organization IDs the user is a member of
    const userOrgIds = await getUserOrganizationIds(session.user.id);

    // Build where clause
    const whereClause: any = {
      organizationId: {
        in: organizationId && userOrgIds.includes(organizationId)
          ? [organizationId]
          : userOrgIds,
      },
    };

    // Filter by project if provided
    if (projectId) {
      whereClause.projectId = projectId;
    }

    // Filter by entity if provided
    if (entityType) {
      whereClause.entityType = entityType;
    }
    if (entityId) {
      whereClause.entityId = entityId;
    }

    const activities = await prisma.activity.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

