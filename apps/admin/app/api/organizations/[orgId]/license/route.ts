import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { isGodUser } from "@/lib/config/godusers";

interface RouteParams {
  params: Promise<{ orgId: string }>;
}

/**
 * PATCH: Update organization license (plan and subscription status)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isGodUser(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { orgId } = await params;

  try {
    const body = await request.json();
    const { planCode, subscriptionStatus } = body;

    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Validate plan code if provided
    if (planCode) {
      const plan = await prisma.plan.findUnique({
        where: { code: planCode },
      });

      if (!plan) {
        return NextResponse.json(
          { error: `Plan "${planCode}" not found` },
          { status: 400 }
        );
      }
    }

    // Update organization
    const updateData: {
      planCode?: string;
      subscriptionStatus?: string | null;
    } = {};

    if (planCode !== undefined) {
      updateData.planCode = planCode;
    }

    if (subscriptionStatus !== undefined) {
      updateData.subscriptionStatus = subscriptionStatus || null;
    }

    const updated = await prisma.organization.update({
      where: { id: orgId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      organization: updated,
      message: "License updated successfully",
    });
  } catch (error) {
    console.error("[Admin License API] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

