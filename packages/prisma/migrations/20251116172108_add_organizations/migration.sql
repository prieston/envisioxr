-- CreateEnum
CREATE TYPE "OrganizationRole" AS ENUM ('owner', 'admin', 'member');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isPersonal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationMember" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "OrganizationRole" NOT NULL DEFAULT 'member',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMember_organizationId_userId_key" ON "OrganizationMember"("organizationId", "userId");

-- CreateIndex
CREATE INDEX "OrganizationMember_userId_idx" ON "OrganizationMember"("userId");

-- CreateIndex
CREATE INDEX "OrganizationMember_organizationId_idx" ON "OrganizationMember"("organizationId");

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 1: Add organizationId columns (nullable initially)
ALTER TABLE "Project" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "Asset" ADD COLUMN "organizationId" TEXT;

-- Step 2: Create personal organizations for each existing user and migrate data
DO $$
DECLARE
    user_record RECORD;
    org_id TEXT;
    org_slug TEXT;
    user_name TEXT;
    member_id TEXT;
    counter INTEGER;
BEGIN
    FOR user_record IN SELECT id, name, email FROM "User" LOOP
        -- Generate organization ID using user ID prefix + timestamp + random suffix
        -- This ensures uniqueness while being compatible with CUID-like format
        org_id := 'org_' || SUBSTRING(user_record.id, 1, 8) || '_' ||
                  TO_CHAR(EXTRACT(EPOCH FROM NOW())::BIGINT, 'FM999999999999') ||
                  '_' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 8);

        -- Create slug from user's name or email
        user_name := COALESCE(user_record.name, user_record.email, 'user');
        -- Clean slug: lowercase, replace spaces with hyphens, remove special chars
        org_slug := LOWER(REGEXP_REPLACE(user_name, '[^a-z0-9]+', '-', 'g'));
        -- Remove leading/trailing hyphens
        org_slug := TRIM(BOTH '-' FROM org_slug);
        -- Ensure uniqueness by appending user ID if needed
        counter := 1;
        WHILE EXISTS (SELECT 1 FROM "Organization" WHERE slug = org_slug) LOOP
            org_slug := org_slug || '-' || SUBSTRING(user_record.id, 1, 8) || '-' || counter;
            counter := counter + 1;
        END LOOP;

        -- Create personal organization
        INSERT INTO "Organization" (id, name, slug, "isPersonal", "createdAt", "updatedAt")
        VALUES (
            org_id,
            COALESCE(user_record.name, user_record.email, 'Personal'),
            org_slug,
            true,
            NOW(),
            NOW()
        );

        -- Generate member ID
        member_id := 'mem_' || SUBSTRING(user_record.id, 1, 8) || '_' ||
                     TO_CHAR(EXTRACT(EPOCH FROM NOW())::BIGINT, 'FM999999999999') ||
                     '_' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 8);

        -- Add user as owner of the organization
        INSERT INTO "OrganizationMember" (id, "organizationId", "userId", role, "createdAt")
        VALUES (
            member_id,
            org_id,
            user_record.id,
            'owner',
            NOW()
        );

        -- Migrate projects
        UPDATE "Project"
        SET "organizationId" = org_id
        WHERE "userId" = user_record.id;

        -- Migrate assets
        UPDATE "Asset"
        SET "organizationId" = org_id
        WHERE "userId" = user_record.id;
    END LOOP;
END $$;

-- Step 3: Make organizationId non-nullable
ALTER TABLE "Project" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "Asset" ALTER COLUMN "organizationId" SET NOT NULL;

-- Step 4: Add foreign key constraints
ALTER TABLE "Project" ADD CONSTRAINT "Project_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 5: Drop old userId columns and foreign keys
ALTER TABLE "Project" DROP CONSTRAINT IF EXISTS "Project_userId_fkey";
ALTER TABLE "Project" DROP COLUMN "userId";

ALTER TABLE "Asset" DROP CONSTRAINT IF EXISTS "Asset_userId_fkey";
ALTER TABLE "Asset" DROP COLUMN "userId";

