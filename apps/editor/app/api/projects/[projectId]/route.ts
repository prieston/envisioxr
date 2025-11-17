import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { NextRequest } from "next/server";
import { Session } from "next-auth";
import { isUserMemberOfOrganization, canUserViewPublishedProject } from "@/lib/organizations";

interface UserSession extends Session {
  user: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
  };
}

interface ProjectParams {
  params: {
    projectId: string;
  };
}

export async function GET(request: NextRequest, { params }: ProjectParams) {
  const { projectId } = params;

  // Try to get the session, but if it fails, that's fine.
  let session: UserSession | null = null;
  try {
    session = (await getServerSession(authOptions)) as UserSession;
  } catch (error) {
    // If fetching the session fails, we simply treat it as no session.
    session = null;
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            isPersonal: true,
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                  },
                },
              },
            },
          },
        },
        assets: {
          orderBy: { createdAt: "desc" },
          take: 50, // Limit assets
        },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 20, // Recent activities
          include: {
            actor: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const userId = session?.user?.id || null;

    // Check if user can view the published project
    const canView = await canUserViewPublishedProject(userId, {
      isPublished: project.isPublished,
      isPublic: project.isPublic,
      organizationId: project.organizationId,
      organization: project.organization,
    });

    if (canView) {
      return NextResponse.json({ project });
    }

    // For unpublished projects, require a valid session and that the user is a member of the project's organization.
    if (!project.isPublished) {
      if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const isMember = await isUserMemberOfOrganization(
        session.user.id,
        project.organizationId
      );
      if (!isMember) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.json({ project });
    }

    // Project is published but user doesn't have access (private project, not authenticated or not a member)
    return NextResponse.json(
      { error: "This published world requires authentication" },
      { status: 403 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: ProjectParams) {
  const { projectId } = params;
  const session = (await getServerSession(authOptions)) as UserSession;
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    // First verify project exists and user is a member of the organization
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    const isMember = await isUserMemberOfOrganization(
      userId,
      project.organizationId
    );
    if (!isMember) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { sceneData } = body;

    if (!sceneData) {
      return NextResponse.json(
        { error: "Scene data is required" },
        { status: 400 }
      );
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        sceneData,
        updatedAt: new Date(),
      },
    });
    return NextResponse.json({ project: updatedProject });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: ProjectParams) {
  const { projectId } = params;
  const session = (await getServerSession(authOptions)) as UserSession;
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    const isMember = await isUserMemberOfOrganization(
      userId,
      project.organizationId
    );
    if (!isMember) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    await prisma.project.delete({
      where: { id: projectId },
    });
    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: ProjectParams) {
  const { projectId } = params;
  const session = (await getServerSession(authOptions)) as UserSession;
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const body = await request.json();
    const { title, description, engine, thumbnail } = body;
    // Ensure the project exists and user is a member of the organization
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    const isMember = await isUserMemberOfOrganization(
      userId,
      project.organizationId
    );
    if (!isMember) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const updateData: {
      title?: string;
      description?: string;
      engine?: "three" | "cesium";
      thumbnail?: string | null;
    } = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (engine !== undefined) updateData.engine = engine;
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: updateData,
    });
    return NextResponse.json({ project: updatedProject });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: ProjectParams) {
  const { projectId } = params;
  const session = (await getServerSession(authOptions)) as UserSession;
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    // Verify project exists and user is a member
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    const isMember = await isUserMemberOfOrganization(
      userId,
      project.organizationId
    );
    if (!isMember) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();

    // Get the organization to check if it's personal
    const organization = await prisma.organization.findUnique({
      where: { id: project.organizationId },
      select: { isPersonal: true },
    });

    const updateData: {
      isPublished?: boolean;
      isPublic?: boolean;
      publishedUrl?: string;
      thumbnail?: string | null;
    } = {};

    // Handle publish/unpublish toggle
    if (body.isPublished !== undefined) {
      updateData.isPublished = body.isPublished;
      if (body.isPublished) {
        updateData.publishedUrl = `/publish/${projectId}`;
      } else {
        updateData.publishedUrl = null;
      }
    }

    // Handle public/private access setting
    // For personal organizations, isPublic is always true (cannot be changed)
    if (body.isPublic !== undefined && organization && !organization.isPersonal) {
      updateData.isPublic = body.isPublic;
    } else if (organization && organization.isPersonal && body.isPublic === false) {
      // If trying to set private on personal org, ignore it (always public)
      updateData.isPublic = true;
    }

    // Handle thumbnail update
    if (body.thumbnail !== undefined) {
      updateData.thumbnail = body.thumbnail;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid action provided" },
        { status: 400 }
      );
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: updateData,
    });
    return NextResponse.json({ project: updatedProject });
  } catch (error) {
    console.error("PATCH /api/projects/[projectId] error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
