import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { isGodUser } from "@/lib/config/godusers";

/**
 * GET: List all organizations
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isGodUser(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // [ADMIN_PRISMA] Using _count to avoid N+1 queries - counts computed in single query
    const organizations = await prisma.organization.findMany({
      include: {
        _count: {
          select: {
            members: true,
            projects: true,
            assets: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ organizations });
  } catch (error) {
    console.error("[Admin Organizations API] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST: Create a new organization
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isGodUser(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get user ID from database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const userId = user.id;

  try {
    const body = await request.json();
    const { name, slug } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Organization name is required" },
        { status: 400 }
      );
    }

    let finalSlug = slug || name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    finalSlug = finalSlug.replace(/^-+|-+$/g, "");

    if (!finalSlug || finalSlug.length === 0) {
      return NextResponse.json(
        { error: "Invalid organization name" },
        { status: 400 }
      );
    }

    const slugRegex = /^[a-z0-9-_]+$/;
    if (!slugRegex.test(finalSlug)) {
      return NextResponse.json(
        {
          error:
            "Slug can only contain lowercase letters, numbers, hyphens, and underscores",
        },
        { status: 400 }
      );
    }

    const existingOrg = await prisma.organization.findUnique({
      where: { slug: finalSlug },
    });

    if (existingOrg) {
      return NextResponse.json({ error: "Slug is already taken" }, { status: 400 });
    }

    const organization = await prisma.organization.create({
      data: {
        name: name.trim(),
        slug: finalSlug,
        isPersonal: false,
      },
    });

    await prisma.organizationMember.create({
      data: {
        organizationId: organization.id,
        userId,
        role: "owner",
      },
    });

    return NextResponse.json({ organization });
  } catch (error) {
    console.error("[Admin Organizations API] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

