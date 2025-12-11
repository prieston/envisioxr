import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { isGodUser } from "@/lib/config/godusers";

interface RouteParams {
  params: Promise<{ orgId: string }>;
}

/**
 * DELETE: Delete organization
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isGodUser(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { orgId } = await params;

  try {
    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    await prisma.organization.delete({
      where: { id: orgId },
    });

    return NextResponse.json({
      success: true,
      message: "Organization deleted successfully",
    });
  } catch (error) {
    console.error("[Admin Organizations API] Error deleting organization:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

