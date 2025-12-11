import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { isGodUser } from "@/lib/config/godusers";

interface RouteParams {
  params: Promise<{ orgId: string }>;
}

/**
 * PATCH: Upgrade personal workspace to organization
 */
export async function PATCH(_request: NextRequest, { params }: RouteParams) {
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

    if (!organization.isPersonal) {
      return NextResponse.json(
        { error: "This organization is already a team organization" },
        { status: 400 }
      );
    }

    // Upgrade personal workspace to organization
    const updated = await prisma.organization.update({
      where: { id: orgId },
      data: {
        isPersonal: false,
      },
    });

    return NextResponse.json({
      success: true,
      organization: updated,
      message: "Personal workspace upgraded to organization successfully",
    });
  } catch (error) {
    console.error("[Admin Upgrade API] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

