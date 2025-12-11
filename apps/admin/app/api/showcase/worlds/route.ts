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

    // Use transaction to ensure world is created BEFORE tags are connected
    const world = await prisma.$transaction(async (tx) => {
      // Step 1: Create the world first (without tags)
      const createdWorld = await tx.showcaseWorld.create({
        data: {
          title,
          description,
          url,
          thumbnailUrl,
          isPublished: isPublished ?? false,
          priority: priority ?? 0,
          projectId: projectId || undefined,
        },
      });

      // Step 2: Connect tags if provided (world now exists, FK constraint will pass)
      if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
        await tx.showcaseWorld.update({
          where: { id: createdWorld.id },
          data: {
            tags: {
              connect: tagIds.map((id: string) => ({ id })),
            },
          },
        });
      }

      // Step 3: Return the world with tags
      return await tx.showcaseWorld.findUnique({
        where: { id: createdWorld.id },
        include: {
          tags: true,
        },
      });
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
    const { id, title, description, url, thumbnailUrl, isPublished, priority, tagIds, projectId } = body;

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

    // Use transaction - update world first, then update tags separately
    const world = await prisma.$transaction(async (tx) => {
      // Step 1: Update world fields first (without tags)
      await tx.showcaseWorld.update({
        where: { id },
        data: {
          title,
          description,
          url,
          thumbnailUrl,
          isPublished,
          priority,
          projectId: projectId !== undefined ? (projectId || null) : undefined,
        },
      });

      // Step 2: Update tags separately (world is already committed in transaction)
      if (tagIds !== undefined) {
        await tx.showcaseWorld.update({
          where: { id },
          data: {
            tags: {
              set: Array.isArray(tagIds) && tagIds.length > 0
                ? tagIds.map((tagId: string) => ({ id: tagId }))
                : [],
            },
          },
        });
      }

      // Step 3: Return the updated world with tags
      return await tx.showcaseWorld.findUnique({
        where: { id },
        include: {
          tags: true,
        },
      });
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

