import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { NextRequest } from "next/server";
import { Session } from "next-auth";
import { isUserMemberOfOrganization } from "@/lib/organizations";

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
          include: {
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

    // If the project is published, return it regardless of session.
    if (project.isPublished) {
      return NextResponse.json({ project });
    }

    // For unpublished projects, require a valid session and that the user is a member of the project's organization.
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
    // Handle publish action
    if (body.publish) {
      const updatedProject = await prisma.project.update({
        where: { id: projectId },
        data: {
          isPublished: true,
          // Optionally, generate a published URL here. For simplicity, we can use the project id.
          publishedUrl: `/publish/${projectId}`,
        },
      });
      return NextResponse.json({ project: updatedProject });
    }
    // Handle thumbnail update
    if (body.thumbnail !== undefined) {
      const updatedProject = await prisma.project.update({
        where: { id: projectId },
        data: {
          thumbnail: body.thumbnail,
        },
      });
      return NextResponse.json({ project: updatedProject });
    }
    return NextResponse.json(
      { error: "No valid action provided" },
      { status: 400 }
    );
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
