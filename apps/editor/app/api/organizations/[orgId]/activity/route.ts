import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { isUserMemberOfOrganization } from "@/lib/organizations";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const session = await auth();
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

    const { searchParams } = new URL(_request.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = parseInt(searchParams.get("skip") || "0", 10);
    const take = parseInt(searchParams.get("take") || limit.toString(), 10);
    const projectId = searchParams.get("projectId");
    const entityType = searchParams.get("entityType");
    const entityId = searchParams.get("entityId");

    // Build where clause - filter by specific organization
    const whereClause: any = {
      organizationId: orgId,
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

    // Get total count for pagination
    const total = await prisma.activity.count({
      where: whereClause,
    });

    const activities = await prisma.activity.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip: skip,
      take: take,
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

    return NextResponse.json({ activities, total });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

