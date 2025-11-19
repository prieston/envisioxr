-- AlterTable: Update CesiumIonIntegration model with new fields
-- First check if columns exist before renaming
DO $$
BEGIN
  -- Rename name to label if name column exists
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'CesiumIonIntegration' AND column_name = 'name') THEN
    ALTER TABLE "CesiumIonIntegration" RENAME COLUMN "name" TO "label";
  END IF;

  -- Rename readOnlyToken to readToken if readOnlyToken column exists
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'CesiumIonIntegration' AND column_name = 'readOnlyToken') THEN
    ALTER TABLE "CesiumIonIntegration" RENAME COLUMN "readOnlyToken" TO "readToken";
  END IF;
END $$;

-- Add new columns (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'CesiumIonIntegration' AND column_name = 'readTokenLast4') THEN
    ALTER TABLE "CesiumIonIntegration" ADD COLUMN "readTokenLast4" TEXT NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'CesiumIonIntegration' AND column_name = 'uploadTokenLast4') THEN
    ALTER TABLE "CesiumIonIntegration" ADD COLUMN "uploadTokenLast4" TEXT NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'CesiumIonIntegration' AND column_name = 'readTokenValid') THEN
    ALTER TABLE "CesiumIonIntegration" ADD COLUMN "readTokenValid" BOOLEAN NOT NULL DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'CesiumIonIntegration' AND column_name = 'uploadTokenValid') THEN
    ALTER TABLE "CesiumIonIntegration" ADD COLUMN "uploadTokenValid" BOOLEAN NOT NULL DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'CesiumIonIntegration' AND column_name = 'readTokenScopes') THEN
    ALTER TABLE "CesiumIonIntegration" ADD COLUMN "readTokenScopes" JSONB;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'CesiumIonIntegration' AND column_name = 'uploadTokenScopes') THEN
    ALTER TABLE "CesiumIonIntegration" ADD COLUMN "uploadTokenScopes" JSONB;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'CesiumIonIntegration' AND column_name = 'cesiumAccountId') THEN
    ALTER TABLE "CesiumIonIntegration" ADD COLUMN "cesiumAccountId" TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'CesiumIonIntegration' AND column_name = 'lastSyncedAt') THEN
    ALTER TABLE "CesiumIonIntegration" ADD COLUMN "lastSyncedAt" TIMESTAMP(3);
  END IF;
END $$;

-- Update existing records to have last4 values (will be empty strings for now)
-- In production, you'd want to backfill these from the encrypted tokens

-- CreateEnumType: CesiumAssetStatus
CREATE TYPE "CesiumAssetStatus" AS ENUM ('active', 'deleted', 'unknown');

-- CreateTable: CesiumAsset
CREATE TABLE "CesiumAsset" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "cesiumAssetId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "attributions" JSONB,
    "status" "CesiumAssetStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CesiumAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CesiumAsset_integrationId_cesiumAssetId_key" ON "CesiumAsset"("integrationId", "cesiumAssetId");

-- CreateIndex
CREATE INDEX "CesiumAsset_organizationId_idx" ON "CesiumAsset"("organizationId");

-- CreateIndex
CREATE INDEX "CesiumAsset_integrationId_idx" ON "CesiumAsset"("integrationId");

-- CreateIndex
CREATE INDEX "CesiumAsset_cesiumAssetId_idx" ON "CesiumAsset"("cesiumAssetId");

-- AddForeignKey
ALTER TABLE "CesiumAsset" ADD CONSTRAINT "CesiumAsset_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CesiumAsset" ADD CONSTRAINT "CesiumAsset_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "CesiumIonIntegration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterEnum: Add new activity types
ALTER TYPE "ActivityEntityType" ADD VALUE IF NOT EXISTS 'CESIUM_INTEGRATION';
ALTER TYPE "ActivityEntityType" ADD VALUE IF NOT EXISTS 'CESIUM_ASSET';
ALTER TYPE "ActivityActionType" ADD VALUE IF NOT EXISTS 'SYNCED';

