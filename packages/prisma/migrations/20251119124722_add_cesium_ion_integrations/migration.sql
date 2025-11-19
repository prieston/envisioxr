-- CreateTable
CREATE TABLE "CesiumIonIntegration" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "readOnlyToken" TEXT NOT NULL,
    "uploadToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CesiumIonIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CesiumIonIntegration_organizationId_idx" ON "CesiumIonIntegration"("organizationId");

-- AddForeignKey
ALTER TABLE "CesiumIonIntegration" ADD CONSTRAINT "CesiumIonIntegration_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

