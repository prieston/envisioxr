/**
 * Plan seed data for Klorad billing system
 * Run with: pnpm prisma db seed
 */

export const PLANS = [
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
    monthlyPriceCents: 14900, // €149.00
    yearlyPriceCents: 178800, // €149.00 * 12
    includedStorageGb: 100,
    includedBandwidthGbPerMonth: 250,
    includedSeats: 9999, // Effectively unlimited
    includedProcessingJobsPerMonth: 20,
    includedProjects: null, // Unlimited
    includedPublishedProjects: null, // Unlimited
    includedPrivateShares: null, // Unlimited
    includedCesiumIntegrations: null, // Unlimited
    cesiumUploadLimitGb: null, // Unlimited
    overageStoragePricePerGbCents: 0,
    overageBandwidthPricePerGbCents: 0,
    overageSeatPricePerMonthCents: 0,
    stripeProductId: null, // Set after creating in Stripe: "prod_xxx_klorad_pro"
    stripePriceIdMonthly: null, // Set after creating in Stripe: "price_xxx_pro_monthly"
    stripePriceIdYearly: null, // Set after creating in Stripe: "price_xxx_pro_yearly"
  },
  {
    code: "enterprise",
    name: "Enterprise",
    monthlyPriceCents: null, // Custom pricing
    yearlyPriceCents: null, // Custom pricing
    includedStorageGb: 9999, // Effectively unlimited
    includedBandwidthGbPerMonth: 9999, // Effectively unlimited
    includedSeats: 9999, // Effectively unlimited
    includedProcessingJobsPerMonth: 9999, // Effectively unlimited
    includedProjects: null, // Unlimited
    includedPublishedProjects: null, // Unlimited
    includedPrivateShares: null, // Unlimited
    includedCesiumIntegrations: null, // Unlimited
    cesiumUploadLimitGb: null, // Unlimited
    overageStoragePricePerGbCents: 0,
    overageBandwidthPricePerGbCents: 0,
    overageSeatPricePerMonthCents: 0,
    stripeProductId: null,
    stripePriceIdMonthly: null,
    stripePriceIdYearly: null,
  },
];

