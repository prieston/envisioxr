import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isGodUser } from "@/lib/config/godusers";

/**
 * GET: List all available plans
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
    // Ensure all plans exist (seed if missing)
    const plansToSeed = [
      {
        code: "free",
        name: "Solo Workspace",
        monthlyPriceCents: 0,
        yearlyPriceCents: 0,
        includedStorageGb: 1,
        includedBandwidthGbPerMonth: 5,
        includedSeats: 0,
        includedProcessingJobsPerMonth: 0,
        includedProjects: 10,
        includedPublishedProjects: 10,
        includedPrivateShares: 1,
        includedCesiumIntegrations: 1,
        cesiumUploadLimitGb: 5,
        overageStoragePricePerGbCents: 0,
        overageBandwidthPricePerGbCents: 0,
        overageSeatPricePerMonthCents: 0,
        stripeProductId: null,
        stripePriceIdMonthly: null,
        stripePriceIdYearly: null,
      },
      {
        code: "pro",
        name: "Organisation Workspace",
        monthlyPriceCents: 14900,
        yearlyPriceCents: 178800,
        includedStorageGb: 100,
        includedBandwidthGbPerMonth: 250,
        includedSeats: 9999,
        includedProcessingJobsPerMonth: 20,
        includedProjects: null,
        includedPublishedProjects: null,
        includedPrivateShares: null,
        includedCesiumIntegrations: null,
        cesiumUploadLimitGb: null,
        overageStoragePricePerGbCents: 0,
        overageBandwidthPricePerGbCents: 0,
        overageSeatPricePerMonthCents: 0,
        stripeProductId: null,
        stripePriceIdMonthly: null,
        stripePriceIdYearly: null,
      },
      {
        code: "enterprise",
        name: "Enterprise",
        monthlyPriceCents: null,
        yearlyPriceCents: null,
        includedStorageGb: 9999,
        includedBandwidthGbPerMonth: 9999,
        includedSeats: 9999,
        includedProcessingJobsPerMonth: 9999,
        includedProjects: null,
        includedPublishedProjects: null,
        includedPrivateShares: null,
        includedCesiumIntegrations: null,
        cesiumUploadLimitGb: null,
        overageStoragePricePerGbCents: 0,
        overageBandwidthPricePerGbCents: 0,
        overageSeatPricePerMonthCents: 0,
        stripeProductId: null,
        stripePriceIdMonthly: null,
        stripePriceIdYearly: null,
      },
    ];

    // Seed all plans if they don't exist
    for (const planData of plansToSeed) {
      const existingPlan = await prisma.plan.findUnique({
        where: { code: planData.code },
      });

      if (!existingPlan) {
        await prisma.plan.create({
          data: planData,
        });
      }
    }

    // [ADMIN_PRISMA] Simple query - no optimization needed
    const plans = await prisma.plan.findMany({
      orderBy: { code: "asc" },
    });

    return NextResponse.json({ plans });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

