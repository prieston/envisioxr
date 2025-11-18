import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { NextRequest } from "next/server";
import { Session } from "next-auth";
import {
  getUserDefaultOrganization,
  getUserOrganizationIds,
} from "@/lib/organizations";

interface UserSession extends Session {
  user: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
  };
}

export async function POST(request: NextRequest) {
  const session = (await getServerSession(authOptions)) as UserSession;
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    // Get user's default organization (personal org)
    const organization = await getUserDefaultOrganization(userId);
    if (!organization) {
      return NextResponse.json(
        { error: "No organization found for user" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      engine = "three",
      organizationId, // Required: organization must be specified
    } = body as {
      title?: string;
      description?: string;
      engine?: "three" | "cesium";
      organizationId?: string;
    };

    // Require organizationId for security
    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId is required" },
        { status: 400 }
      );
    }

    // Verify user is a member of the target organization
    const userOrgIds = await getUserOrganizationIds(userId);
    if (!userOrgIds.includes(organizationId)) {
      return NextResponse.json(
        { error: "User is not a member of the specified organization" },
        { status: 403 }
      );
    }

    const project = await prisma.project.create({
      data: {
        title: title || "Untitled Project",
        description: description || "",
        organizationId,
        sceneData: {},
        engine,
        isPublished: false,
      },
    });

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const session = (await getServerSession(authOptions)) as UserSession;
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get("search")?.trim() || "";
    const organizationId = searchParams.get("organizationId");

    // Require organizationId for security
    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId is required" },
        { status: 400 }
      );
    }

    // Verify user is a member of the specified organization
    const userOrgIds = await getUserOrganizationIds(userId);
    if (!userOrgIds.includes(organizationId)) {
      return NextResponse.json(
        { error: "User is not a member of the specified organization" },
        { status: 403 }
      );
    }

    // Build where clause - filter by specific organization
    const whereClause: any = {
      organizationId,
    };

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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("[Projects API] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
