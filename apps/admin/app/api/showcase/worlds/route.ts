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
        tag: true,
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
    const { title, description, url, thumbnailUrl, isPublished, priority, tagId, projectId } = body;

    // Create world with tagId directly (no transaction needed - simple FK)
    const world = await prisma.showcaseWorld.create({
      data: {
        title,
        description,
        url,
        thumbnailUrl,
        isPublished: isPublished ?? false,
        priority: priority ?? 0,
        projectId: projectId || undefined,
        tagId: tagId || undefined,
      },
      include: {
        tag: true,
      },
    });

    return NextResponse.json({ world });
  } catch (error) {
    console.error("[Showcase Worlds API] Error:", error);
    // Enhanced error logging
    if (error && typeof error === 'object' && 'code' in error) {
      console.error("Prisma error code:", (error as any).code);
      console.error("Prisma error meta:", JSON.stringify((error as any).meta, null, 2));
    }
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
    const { id, title, description, url, thumbnailUrl, isPublished, priority, tagId, projectId } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Verify world exists first
    const existingWorld = await prisma.showcaseWorld.findUnique({
      where: { id },
    });

    if (!existingWorld) {
      return NextResponse.json({ error: "World not found" }, { status: 404 });
    }

    // Update world with tagId directly (no transaction needed - simple FK)
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
        tagId: tagId !== undefined ? (tagId || null) : undefined,
      },
      include: {
        tag: true,
      },
    });

    return NextResponse.json({ world });
  } catch (error) {
    console.error("[Showcase Worlds API] Error:", error);
    // Enhanced error logging
    if (error && typeof error === 'object' && 'code' in error) {
      console.error("Prisma error code:", (error as any).code);
      console.error("Prisma error meta:", JSON.stringify((error as any).meta, null, 2));
    }
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

