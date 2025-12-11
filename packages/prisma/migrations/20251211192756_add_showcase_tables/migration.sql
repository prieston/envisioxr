-- CreateTable: ShowcaseWorld
CREATE TABLE IF NOT EXISTS "ShowcaseWorld" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnailUrl" TEXT,
    "url" TEXT NOT NULL,
    "projectId" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShowcaseWorld_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ShowcaseTag
CREATE TABLE IF NOT EXISTS "ShowcaseTag" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShowcaseTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS "_WorldTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex: ShowcaseWorld.projectId unique constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE indexname = 'ShowcaseWorld_projectId_key'
    ) THEN
        CREATE UNIQUE INDEX "ShowcaseWorld_projectId_key" ON "ShowcaseWorld"("projectId");
    END IF;
END $$;

-- CreateIndex: ShowcaseTag.slug unique constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE indexname = 'ShowcaseTag_slug_key'
    ) THEN
        CREATE UNIQUE INDEX "ShowcaseTag_slug_key" ON "ShowcaseTag"("slug");
    END IF;
END $$;

-- CreateIndex: ShowcaseWorld composite index
CREATE INDEX IF NOT EXISTS "ShowcaseWorld_isPublished_priority_idx" ON "ShowcaseWorld"("isPublished", "priority");

-- CreateIndex: Junction table indexes
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE indexname = '_WorldTags_AB_unique'
    ) THEN
        CREATE UNIQUE INDEX "_WorldTags_AB_unique" ON "_WorldTags"("A", "B");
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE indexname = '_WorldTags_B_index'
    ) THEN
        CREATE INDEX "_WorldTags_B_index" ON "_WorldTags"("B");
    END IF;
END $$;

-- AddForeignKey: ShowcaseWorld.projectId -> Project.id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'ShowcaseWorld_projectId_fkey'
    ) THEN
        ALTER TABLE "ShowcaseWorld" ADD CONSTRAINT "ShowcaseWorld_projectId_fkey"
        FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey: _WorldTags.A -> ShowcaseWorld.id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = '_WorldTags_A_fkey'
    ) THEN
        ALTER TABLE "_WorldTags" ADD CONSTRAINT "_WorldTags_A_fkey"
        FOREIGN KEY ("A") REFERENCES "ShowcaseWorld"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey: _WorldTags.B -> ShowcaseTag.id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = '_WorldTags_B_fkey'
    ) THEN
        ALTER TABLE "_WorldTags" ADD CONSTRAINT "_WorldTags_B_fkey"
        FOREIGN KEY ("B") REFERENCES "ShowcaseTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

