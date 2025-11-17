-- AlterTable: Add updatedAt column to Asset table
-- This column is required by Prisma schema but was missing from the database
ALTER TABLE "Asset" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

