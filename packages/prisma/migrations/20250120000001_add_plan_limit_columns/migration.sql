-- Add new columns to Plan table for project/cesium limits
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

-- Update existing plans with new values
UPDATE "Plan" SET
  "includedProjects" = 10,
  "includedPublishedProjects" = 10,
  "includedPrivateShares" = 1,
  "includedCesiumIntegrations" = 1,
  "cesiumUploadLimitGb" = 5,
  "name" = 'Solo Workspace',
  "includedSeats" = 0,
  "monthlyPriceCents" = 0,
  "yearlyPriceCents" = 0
WHERE "code" = 'free';

UPDATE "Plan" SET
  "includedProjects" = NULL,
  "includedPublishedProjects" = NULL,
  "includedPrivateShares" = NULL,
  "includedCesiumIntegrations" = NULL,
  "cesiumUploadLimitGb" = NULL,
  "name" = 'Organisation Workspace',
  "includedSeats" = 9999,
  "monthlyPriceCents" = 14900,
  "yearlyPriceCents" = 178800
WHERE "code" = 'pro';

UPDATE "Plan" SET
  "includedProjects" = NULL,
  "includedPublishedProjects" = NULL,
  "includedPrivateShares" = NULL,
  "includedCesiumIntegrations" = NULL,
  "cesiumUploadLimitGb" = NULL,
  "includedStorageGb" = 9999,
  "includedBandwidthGbPerMonth" = 9999,
  "includedSeats" = 9999,
  "includedProcessingJobsPerMonth" = 9999
WHERE "code" = 'enterprise';


