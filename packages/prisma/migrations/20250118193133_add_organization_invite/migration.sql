-- AlterEnum
-- Add 'publicViewer' to OrganizationRole enum if it doesn't exist
DO $$ BEGIN
    -- Drop default constraint temporarily
    ALTER TABLE "OrganizationMember" ALTER COLUMN "role" DROP DEFAULT;

    -- Create new enum type
    CREATE TYPE "OrganizationRole_new" AS ENUM ('owner', 'admin', 'member', 'publicViewer');

    -- Alter column type
    ALTER TABLE "OrganizationMember" ALTER COLUMN "role" TYPE "OrganizationRole_new" USING ("role"::text::"OrganizationRole_new");

    -- Rename types
    ALTER TYPE "OrganizationRole" RENAME TO "OrganizationRole_old";
    ALTER TYPE "OrganizationRole_new" RENAME TO "OrganizationRole";

    -- Restore default
    ALTER TABLE "OrganizationMember" ALTER COLUMN "role" SET DEFAULT 'member'::"OrganizationRole";

    -- Drop old type
    DROP TYPE "OrganizationRole_old";
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "OrganizationInvite" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "OrganizationRole" NOT NULL DEFAULT 'member',
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "invitedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "OrganizationInvite_token_key" ON "OrganizationInvite"("token");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "OrganizationInvite_organizationId_email_key" ON "OrganizationInvite"("organizationId", "email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "OrganizationInvite_email_idx" ON "OrganizationInvite"("email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "OrganizationInvite_token_idx" ON "OrganizationInvite"("token");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "OrganizationInvite_organizationId_idx" ON "OrganizationInvite"("organizationId");

-- AddForeignKey
ALTER TABLE "OrganizationInvite" ADD CONSTRAINT "OrganizationInvite_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationInvite" ADD CONSTRAINT "OrganizationInvite_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

