/*
  Warnings:

  - You are about to drop the column `source` on the `Asset` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('model', 'cesiumIonAsset');

-- AlterTable
ALTER TABLE "Asset" DROP COLUMN "source",
ADD COLUMN     "assetType" "AssetType" NOT NULL DEFAULT 'model';

-- DropEnum
DROP TYPE "AssetSource";
