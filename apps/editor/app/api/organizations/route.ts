import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST: Create a new organization
 * Creates a new organization and adds the user as owner
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const body = await request.json();
    const { name, slug } = body;

    // Validate inputs
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Organization name is required" },
        { status: 400 }
      );
    }

    // Generate slug from name if not provided
    let finalSlug = slug || name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    finalSlug = finalSlug.replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

    if (!finalSlug || finalSlug.length === 0) {
      return NextResponse.json(
        { error: "Invalid organization name" },
        { status: 400 }
      );
    }

    // Validate slug format (alphanumeric, hyphens, underscores)
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

    // Check if slug is already taken
    const existingOrg = await prisma.organization.findUnique({
      where: { slug: finalSlug },
    });

    if (existingOrg) {
      return NextResponse.json({ error: "Slug is already taken" }, { status: 400 });
    }

    // Create organization
    const organization = await prisma.organization.create({
      data: {
        name: name.trim(),
        slug: finalSlug,
        isPersonal: false, // Team organizations
      },
    });

    // Add user as owner
    await prisma.organizationMember.create({
      data: {
        organizationId: organization.id,
        userId,
        role: "owner",
      },
    });

    return NextResponse.json({ organization });
  } catch (error) {
    console.error("[Organizations API] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

