-- AlterEnum
ALTER TYPE "OrganizationRole" ADD VALUE 'publicViewer';

-- AlterTable
ALTER TABLE "Project" ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT true;

-- Update existing published projects to be public
UPDATE "Project" SET "isPublic" = true WHERE "isPublished" = true;

