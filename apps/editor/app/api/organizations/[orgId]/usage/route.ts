import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { isUserMemberOfOrganization } from "@/lib/organizations";

interface RouteParams {
  params: { orgId: string };
}

/**
 * GET: Get organization usage statistics
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const { orgId } = await params;

  try {
    // Verify user is a member of this organization
    const isMember = await isUserMemberOfOrganization(userId, orgId);
    if (!isMember) {
      return NextResponse.json(
        { error: "User is not a member of this organization" },
        { status: 403 }
      );
    }

    // Get organization with plan
    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        plan: true,
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    const plan = organization.plan;

    // Count members
    // For personal organizations, ensure we count at least 1 (the owner)
    // In case the member record wasn't created properly, we still show 1
    let memberCount = await prisma.organizationMember.count({
      where: { organizationId: orgId },
    });

    // If it's a personal org and no members found, it should still show 1
    // (the owner should always exist, but handle edge case)
    if (organization.isPersonal && memberCount === 0) {
      memberCount = 1;
    }

    // Count projects
    const projectCount = await prisma.project.count({
      where: { organizationId: orgId },
    });

    // Count published projects
    const publishedProjectCount = await prisma.project.count({
      where: {
        organizationId: orgId,
        isPublished: true,
      },
    });

    // Count private shares (projects that are published but not public)
    const privateShareCount = await prisma.project.count({
      where: {
        organizationId: orgId,
        isPublished: true,
        isPublic: false,
      },
    });

    // Count Cesium integrations
    const cesiumIntegrationCount = await prisma.cesiumIonIntegration.count({
      where: { organizationId: orgId },
    });

    // Calculate storage used (in bytes) - only count files stored in our S3 bucket
    // Exclude Cesium Ion assets as they are stored on Cesium's servers
    const assets = await prisma.asset.findMany({
      where: {
        organizationId: orgId,
        assetType: { not: "cesiumIonAsset" }, // Exclude Cesium Ion assets
      },
      select: {
        fileSize: true,
        assetType: true,
      },
    });

    let totalStorageBytes = 0;
    assets.forEach((asset) => {
      if (asset.fileSize) {
        const size =
          typeof asset.fileSize === "bigint"
            ? Number(asset.fileSize)
            : asset.fileSize;
        totalStorageBytes += size;
      }
    });

    // Convert bytes to GB (decimal, 10^9) for our storage
    const storageUsedGb = totalStorageBytes / (1000 * 1000 * 1000);

    // Calculate Cesium upload limit usage (sum of Cesium Ion asset sizes)
    // These are stored on Cesium's servers, not ours
    // Cesium uses GiB (binary, 2^30) for their display
    const cesiumAssets = await prisma.asset.findMany({
      where: {
        organizationId: orgId,
        assetType: "cesiumIonAsset",
      },
      select: {
        metadata: true,
      },
    });

    let cesiumUploadBytes = 0;
    cesiumAssets.forEach((asset) => {
      if (asset.metadata && typeof asset.metadata === "object") {
        const metadata = asset.metadata as Record<string, unknown>;
        if (typeof metadata.bytes === "number") {
          cesiumUploadBytes += metadata.bytes;
        }
      }
    });
    // Convert to GiB (binary, 2^30) to match Cesium's display
    const cesiumUploadUsedGib = cesiumUploadBytes / (1024 * 1024 * 1024);

    return NextResponse.json({
      usage: {
        members: memberCount,
        projects: projectCount,
        publishedProjects: publishedProjectCount,
        privateShares: privateShareCount,
        cesiumIntegrations: cesiumIntegrationCount,
        storageGb: storageUsedGb,
        cesiumUploadGib: cesiumUploadUsedGib, // GiB (binary) to match Cesium
      },
      limits: {
        members: plan?.includedSeats ?? 0,
        projects: plan?.includedProjects ?? null, // null = unlimited
        publishedProjects: plan?.includedPublishedProjects ?? null,
        privateShares: plan?.includedPrivateShares ?? null,
        cesiumIntegrations: plan?.includedCesiumIntegrations ?? null,
        storageGb: plan?.includedStorageGb ?? 0,
        // Cesium uses GiB (binary), so treat the stored GB value as GiB
        // The database stores "5 GB" but Cesium's free tier is actually 5 GiB
        cesiumUploadGib: plan?.cesiumUploadLimitGb ?? null,
      },
      plan: {
        code: plan?.code ?? "free",
        name: plan?.name ?? "Free",
      },
    });
  } catch (error) {
    console.error("[Usage API] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

