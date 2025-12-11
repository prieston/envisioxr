import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isGodUser } from "@/lib/config/godusers";

// GET: List all showcase worlds
export async function GET() {
  const session = await auth();
  if (!session?.user?.email || !isGodUser(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const worlds = await prisma.showcaseWorld.findMany({
      include: {
        tags: true,
      },
      orderBy: { priority: "desc" },
    });

    return NextResponse.json({ worlds });
  } catch (error) {
    console.error("[Showcase Worlds API] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST: Create a new showcase world
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email || !isGodUser(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { title, description, url, thumbnailUrl, isPublished, priority, tagIds, projectId } = body;

    const world = await prisma.showcaseWorld.create({
      data: {
        title,
        description,
        url,
        thumbnailUrl,
        isPublished: isPublished ?? false,
        priority: priority ?? 0,
        projectId: projectId || undefined,
        tags: tagIds
          ? {
              connect: tagIds.map((id: string) => ({ id })),
            }
          : undefined,
      },
      include: {
        tags: true,
      },
    });

    return NextResponse.json({ world });
  } catch (error) {
    console.error("[Showcase Worlds API] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT: Update a showcase world
export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.email || !isGodUser(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, title, description, url, thumbnailUrl, isPublished, priority, tagIds, projectId } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const world = await prisma.showcaseWorld.update({
      where: { id },
      data: {
        title,
        description,
        url,
        thumbnailUrl,
        isPublished,
        priority,
        projectId: projectId !== undefined ? (projectId || null) : undefined,
        tags: tagIds
          ? {
              set: tagIds.map((tagId: string) => ({ id: tagId })),
            }
          : undefined,
      },
      include: {
        tags: true,
      },
    });

    return NextResponse.json({ world });
  } catch (error) {
    console.error("[Showcase Worlds API] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a showcase world
export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.email || !isGodUser(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.showcaseWorld.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Showcase Worlds API] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

