-- CreateTable: Plan
CREATE TABLE IF NOT EXISTS "Plan" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "monthlyPriceCents" INTEGER,
    "yearlyPriceCents" INTEGER,
    "includedStorageGb" INTEGER NOT NULL,
    "includedBandwidthGbPerMonth" INTEGER NOT NULL,
    "includedSeats" INTEGER NOT NULL,
    "includedProcessingJobsPerMonth" INTEGER NOT NULL,
    "overageStoragePricePerGbCents" INTEGER NOT NULL DEFAULT 0,
    "overageBandwidthPricePerGbCents" INTEGER NOT NULL DEFAULT 0,
    "overageSeatPricePerMonthCents" INTEGER NOT NULL DEFAULT 0,
    "stripeProductId" TEXT,
    "stripePriceIdMonthly" TEXT,
    "stripePriceIdYearly" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("code")
);

-- Add new columns to Plan table (if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'Plan' AND column_name = 'includedProjects') THEN
    ALTER TABLE "Plan" ADD COLUMN "includedProjects" INTEGER;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'Plan' AND column_name = 'includedPublishedProjects') THEN
    ALTER TABLE "Plan" ADD COLUMN "includedPublishedProjects" INTEGER;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'Plan' AND column_name = 'includedPrivateShares') THEN
    ALTER TABLE "Plan" ADD COLUMN "includedPrivateShares" INTEGER;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'Plan' AND column_name = 'includedCesiumIntegrations') THEN
    ALTER TABLE "Plan" ADD COLUMN "includedCesiumIntegrations" INTEGER;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'Plan' AND column_name = 'cesiumUploadLimitGb') THEN
    ALTER TABLE "Plan" ADD COLUMN "cesiumUploadLimitGb" INTEGER;
  END IF;
END $$;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Plan_code_idx" ON "Plan"("code");

-- Seed plans data FIRST (before adding foreign key constraint)
INSERT INTO "Plan" (
    "code",
    "name",
    "monthlyPriceCents",
    "yearlyPriceCents",
    "includedStorageGb",
    "includedBandwidthGbPerMonth",
    "includedSeats",
    "includedProcessingJobsPerMonth",
    "includedProjects",
    "includedPublishedProjects",
    "includedPrivateShares",
    "includedCesiumIntegrations",
    "cesiumUploadLimitGb",
    "overageStoragePricePerGbCents",
    "overageBandwidthPricePerGbCents",
    "overageSeatPricePerMonthCents",
    "stripeProductId",
    "stripePriceIdMonthly",
    "stripePriceIdYearly",
    "updatedAt"
) VALUES
    (
        'free',
        'Solo Workspace',
        0,
        0,
        1,
        5,
        0,
        0,
        10,
        10,
        1,
        1,
        5,
        0,
        0,
        0,
        NULL,
        NULL,
        NULL,
        CURRENT_TIMESTAMP
    ),
    (
        'pro',
        'Organisation Workspace',
        14900,
        178800,
        100,
        250,
        9999,
        20,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        0,
        0,
        0,
        NULL,
        NULL,
        NULL,
        CURRENT_TIMESTAMP
    ),
    (
        'enterprise',
        'Enterprise',
        NULL,
        NULL,
        9999,
        9999,
        9999,
        9999,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        0,
        0,
        0,
        NULL,
        NULL,
        NULL,
        CURRENT_TIMESTAMP
    )
ON CONFLICT ("code") DO UPDATE SET
    "name" = EXCLUDED."name",
    "monthlyPriceCents" = EXCLUDED."monthlyPriceCents",
    "yearlyPriceCents" = EXCLUDED."yearlyPriceCents",
    "includedStorageGb" = EXCLUDED."includedStorageGb",
    "includedBandwidthGbPerMonth" = EXCLUDED."includedBandwidthGbPerMonth",
    "includedSeats" = EXCLUDED."includedSeats",
    "includedProcessingJobsPerMonth" = EXCLUDED."includedProcessingJobsPerMonth",
    "includedProjects" = EXCLUDED."includedProjects",
    "includedPublishedProjects" = EXCLUDED."includedPublishedProjects",
    "includedPrivateShares" = EXCLUDED."includedPrivateShares",
    "includedCesiumIntegrations" = EXCLUDED."includedCesiumIntegrations",
    "cesiumUploadLimitGb" = EXCLUDED."cesiumUploadLimitGb",
    "updatedAt" = CURRENT_TIMESTAMP;

-- Add billing columns to Organization (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'Organization' AND column_name = 'planCode') THEN
    ALTER TABLE "Organization" ADD COLUMN "planCode" TEXT NOT NULL DEFAULT 'free';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'Organization' AND column_name = 'stripeCustomerId') THEN
    ALTER TABLE "Organization" ADD COLUMN "stripeCustomerId" TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'Organization' AND column_name = 'stripeSubscriptionId') THEN
    ALTER TABLE "Organization" ADD COLUMN "stripeSubscriptionId" TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'Organization' AND column_name = 'subscriptionStatus') THEN
    ALTER TABLE "Organization" ADD COLUMN "subscriptionStatus" TEXT;
  END IF;
END $$;

-- CreateIndex for Organization planCode
CREATE INDEX IF NOT EXISTS "Organization_planCode_idx" ON "Organization"("planCode");

-- CreateUniqueConstraint for stripeCustomerId
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'Organization_stripeCustomerId_key'
  ) THEN
    ALTER TABLE "Organization" ADD CONSTRAINT "Organization_stripeCustomerId_key" UNIQUE ("stripeCustomerId");
  END IF;
END $$;

-- CreateUniqueConstraint for stripeSubscriptionId
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'Organization_stripeSubscriptionId_key'
  ) THEN
    ALTER TABLE "Organization" ADD CONSTRAINT "Organization_stripeSubscriptionId_key" UNIQUE ("stripeSubscriptionId");
  END IF;
END $$;

-- AddForeignKey: Organization.planCode -> Plan.code (AFTER plans are inserted)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'Organization_planCode_fkey'
  ) THEN
    ALTER TABLE "Organization" ADD CONSTRAINT "Organization_planCode_fkey"
    FOREIGN KEY ("planCode") REFERENCES "Plan"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

