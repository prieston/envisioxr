import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET: Fetch all available plans
 */
export async function GET(_request: NextRequest) {
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


