-- DropForeignKey: _WorldTags.A -> ShowcaseWorld.id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = '_WorldTags_A_fkey'
    ) THEN
        ALTER TABLE "_WorldTags" DROP CONSTRAINT "_WorldTags_A_fkey";
    END IF;
END $$;

-- DropForeignKey: _WorldTags.B -> ShowcaseTag.id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = '_WorldTags_B_fkey'
    ) THEN
        ALTER TABLE "_WorldTags" DROP CONSTRAINT "_WorldTags_B_fkey";
    END IF;
END $$;

-- DropTable: _WorldTags junction table
DROP TABLE IF EXISTS "_WorldTags";

-- AlterTable: Add tagId column to ShowcaseWorld
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ShowcaseWorld' AND column_name = 'tagId'
    ) THEN
        ALTER TABLE "ShowcaseWorld" ADD COLUMN "tagId" TEXT;
    END IF;
END $$;

-- AddForeignKey: ShowcaseWorld.tagId -> ShowcaseTag.id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'ShowcaseWorld_tagId_fkey'
    ) THEN
        ALTER TABLE "ShowcaseWorld" ADD CONSTRAINT "ShowcaseWorld_tagId_fkey"
        FOREIGN KEY ("tagId") REFERENCES "ShowcaseTag"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

