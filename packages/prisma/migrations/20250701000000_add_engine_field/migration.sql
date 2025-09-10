-- CreateEnum
CREATE TYPE "Engine" AS ENUM ('three', 'cesium');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN "engine" "Engine" NOT NULL DEFAULT 'three';
