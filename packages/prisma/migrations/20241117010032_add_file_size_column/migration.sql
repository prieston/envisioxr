-- AlterTable: Add fileSize column with default value of 0
-- This ensures existing rows get a default value and the migration doesn't fail
-- Using IF NOT EXISTS to prevent errors if column already exists
ALTER TABLE "Asset" ADD COLUMN IF NOT EXISTS "fileSize" BIGINT;

-- Set default value for the column
ALTER TABLE "Asset" ALTER COLUMN "fileSize" SET DEFAULT 0;

-- Update all existing rows to have 0 instead of NULL
-- This ensures consistent data and prevents NULL issues
UPDATE "Asset" SET "fileSize" = 0 WHERE "fileSize" IS NULL;

