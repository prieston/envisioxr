import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isGodUser } from "@/lib/config/godusers";

// GET: List all tags
export async function GET() {
  const session = await auth();
  if (!session?.user?.email || !isGodUser(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const tags = await prisma.showcaseTag.findMany({
      orderBy: { label: "asc" },
    });

    return NextResponse.json({ tags });
  } catch (error) {
    console.error("[Showcase Tags API] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST: Create a new tag
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email || !isGodUser(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { label, slug, color } = body;

    const tag = await prisma.showcaseTag.create({
      data: {
        label,
        slug: slug || label.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        color,
      },
    });

    return NextResponse.json({ tag });
  } catch (error) {
    console.error("[Showcase Tags API] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a tag
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

    await prisma.showcaseTag.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Showcase Tags API] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

