-- CreateEnum
CREATE TYPE "AssetSource" AS ENUM ('UPLOAD', 'CESIUM_ION');

-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "cesiumApiKey" TEXT,
ADD COLUMN     "cesiumAssetId" TEXT,
ADD COLUMN     "source" "AssetSource" NOT NULL DEFAULT 'UPLOAD';
