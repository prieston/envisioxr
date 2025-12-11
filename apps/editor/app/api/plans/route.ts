import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET: Fetch all available plans
 */
export async function GET(_request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const plans = await prisma.plan.findMany({
      orderBy: {
        monthlyPriceCents: {
          sort: "asc",
          nulls: "last",
        },
      },
    });

    return NextResponse.json({ plans });
  } catch (error) {
    console.error("[Plans API] Error fetching plans:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}


