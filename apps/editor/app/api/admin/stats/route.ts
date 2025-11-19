import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { isGodUser } from "@/lib/config/godusers";

export async function GET() {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is a god user
  if (!isGodUser(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Get all counts
    const [
      totalUsers,
      totalOrganizations,
      totalProjects,
      totalAssets,
      totalSubscriptions,
      totalActivities,
      totalAccounts,
      totalSessions,
      totalVerificationTokens,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.organization.count(),
      prisma.project.count(),
      prisma.asset.count(),
      prisma.subscription.count(),
      prisma.activity.count(),
      prisma.account.count(),
      prisma.session.count(),
      prisma.verificationToken.count(),
    ]);

    // Get session statistics
    const activeSessions = await prisma.session.count({
      where: { expires: { gte: new Date() } },
    });

    const expiredSessions = await prisma.session.count({
      where: { expires: { lt: new Date() } },
    });

    // Get user statistics
    const usersWithVerifiedEmail = await prisma.user.count({
      where: { emailVerified: { not: null } },
    });

    const usersWithSubscriptions = await prisma.user.count({
      where: { subscription: { isNot: null } },
    });

    const usersWithPassword = await prisma.user.count({
      where: { password: { not: null } },
    });

    const usersWithPasswordReset = await prisma.user.count({
      where: {
        passwordResetToken: { not: null },
        passwordResetTokenExp: { gte: new Date() },
      },
    });

    const usersByProvider = await prisma.account.groupBy({
      by: ["provider"],
      _count: { provider: true },
    });

    const accountsByType = await prisma.account.groupBy({
      by: ["type"],
      _count: { type: true },
    });

    // Get organization statistics
    const personalOrgs = await prisma.organization.count({
      where: { isPersonal: true },
    });

    const teamOrgs = await prisma.organization.count({
      where: { isPersonal: false },
    });

    const orgsByMemberCount = await prisma.organizationMember.groupBy({
      by: ["organizationId"],
      _count: { userId: true },
    });

    const avgMembersPerOrg =
      totalOrganizations > 0
        ? orgsByMemberCount.reduce((sum, org) => sum + org._count.userId, 0) /
          totalOrganizations
        : 0;

    // Get organization member role distribution
    const membersByRole = await prisma.organizationMember.groupBy({
      by: ["role"],
      _count: { role: true },
    });

    // Get project statistics
    const publishedProjects = await prisma.project.count({
      where: { isPublished: true },
    });

    const publicProjects = await prisma.project.count({
      where: { isPublic: true },
    });

    const projectsWithThumbnail = await prisma.project.count({
      where: { thumbnail: { not: null } },
    });

    const projectsWithPublishedUrl = await prisma.project.count({
      where: { publishedUrl: { not: null } },
    });

    const projectsByEngine = await prisma.project.groupBy({
      by: ["engine"],
      _count: { engine: true },
    });

    // Get asset statistics
    const assetsByType = await prisma.asset.groupBy({
      by: ["assetType"],
      _count: { assetType: true },
    });

    const assetsWithProjects = await prisma.asset.count({
      where: { projectId: { not: null } },
    });

    const assetsWithThumbnail = await prisma.asset.count({
      where: { thumbnail: { not: null } },
    });

    const assetsWithMetadata = await prisma.asset.count({
      where: { metadata: { not: null } },
    });

    const cesiumIonAssets = await prisma.asset.count({
      where: {
        assetType: "cesiumIonAsset",
        cesiumAssetId: { not: null },
      },
    });

    const cesiumIonAssetsWithApiKey = await prisma.asset.count({
      where: {
        assetType: "cesiumIonAsset",
        cesiumApiKey: { not: null },
      },
    });

    // Calculate total storage
    const allAssets = await prisma.asset.findMany({
      select: {
        fileSize: true,
        assetType: true,
        metadata: true,
      },
    });

    let totalStorageBytes = 0;
    allAssets.forEach((asset) => {
      if (asset.fileSize) {
        const size =
          typeof asset.fileSize === "bigint"
            ? Number(asset.fileSize)
            : asset.fileSize;
        totalStorageBytes += size;
      } else if (
        asset.assetType === "cesiumIonAsset" &&
        asset.metadata &&
        typeof asset.metadata === "object"
      ) {
        const metadata = asset.metadata as Record<string, unknown>;
        if (typeof metadata.bytes === "number") {
          totalStorageBytes += metadata.bytes;
        }
      }
    });

    // Get subscription statistics
    const subscriptionsByStatus = await prisma.subscription.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const subscriptionsByPlan = await prisma.subscription.groupBy({
      by: ["planId"],
      _count: { planId: true },
    });

    const activeSubscriptions = await prisma.subscription.count({
      where: {
        OR: [
          { endDate: null },
          { endDate: { gte: new Date() } },
        ],
      },
    });

    const expiredSubscriptions = await prisma.subscription.count({
      where: {
        endDate: { lt: new Date() },
      },
    });

    // Get activity statistics
    const activitiesByType = await prisma.activity.groupBy({
      by: ["entityType"],
      _count: { entityType: true },
    });

    const activitiesByAction = await prisma.activity.groupBy({
      by: ["action"],
      _count: { action: true },
    });

    const activitiesWithMetadata = await prisma.activity.count({
      where: { metadata: { not: null } },
    });

    const activitiesWithMessage = await prisma.activity.count({
      where: { message: { not: null } },
    });

    const projectLevelActivities = await prisma.activity.count({
      where: { projectId: { not: null } },
    });

    const orgLevelActivities = await prisma.activity.count({
      where: { projectId: null },
    });

    // Get recent activities (last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const recentActivities = await prisma.activity.count({
      where: { createdAt: { gte: oneDayAgo } },
    });

    // Get recent users (last 7 days)
    // Note: User and Account models don't have createdAt fields in the schema
    // So we cannot track when users were created. Setting to 0.
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentUsers = 0; // Cannot track - User model lacks createdAt field

    // Get recent projects (last 7 days)
    const recentProjects = await prisma.project.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    });

    // Get top organizations by project count
    const topOrgsByProjects = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { projects: true } },
      },
      orderBy: { projects: { _count: "desc" } },
      take: 10,
    });

    // Get top organizations by asset count
    const topOrgsByAssets = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { assets: true } },
      },
      orderBy: { assets: { _count: "desc" } },
      take: 10,
    });

    // Get all organizations with member counts
    const allOrganizations = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        isPersonal: true,
        createdAt: true,
        _count: {
          select: {
            members: true,
            projects: true,
            assets: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get all users with their details
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        _count: {
          select: {
            activities: true,
            organizationMembers: true,
            accounts: true,
            sessions: true,
          },
        },
      },
      orderBy: { email: "asc" },
    });

    // Get top users by activity count
    const topUsersByActivity = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        _count: { select: { activities: true } },
      },
      orderBy: { activities: { _count: "desc" } },
      take: 10,
    });

    // Get users with most organizations
    const usersWithMostOrgs = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        _count: { select: { organizationMembers: true } },
      },
      orderBy: { organizationMembers: { _count: "desc" } },
      take: 10,
    });

    // Get file type distribution
    const assetsByFileType = await prisma.asset.groupBy({
      by: ["fileType"],
      _count: { fileType: true },
      orderBy: { _count: { fileType: "desc" } },
      take: 10,
    });

    // Get time-based statistics (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activitiesLast30Days = await prisma.activity.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    // Group activities by day
    const activitiesByDay: Record<string, number> = {};
    activitiesLast30Days.forEach((activity) => {
      const date = activity.createdAt.toISOString().split("T")[0];
      activitiesByDay[date] = (activitiesByDay[date] || 0) + 1;
    });

    return NextResponse.json({
      overview: {
        totalUsers,
        totalOrganizations,
        totalProjects,
        totalAssets,
        totalSubscriptions,
        totalActivities,
        totalAccounts,
        totalSessions,
        totalVerificationTokens,
        totalStorageBytes,
        totalStorageGB: totalStorageBytes / (1024 * 1024 * 1024),
      },
      users: {
        total: totalUsers,
        verified: usersWithVerifiedEmail,
        withSubscriptions: usersWithSubscriptions,
        withPassword: usersWithPassword,
        withPasswordReset: usersWithPasswordReset,
        byProvider: usersByProvider.map((item) => ({
          provider: item.provider,
          count: item._count.provider,
        })),
        recent: recentUsers,
        all: allUsers.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          image: user.image,
          activityCount: user._count.activities,
          organizationCount: user._count.organizationMembers,
          accountCount: user._count.accounts,
          sessionCount: user._count.sessions,
        })),
        topByActivity: topUsersByActivity.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          activityCount: user._count.activities,
        })),
        topByOrganizations: usersWithMostOrgs.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          organizationCount: user._count.organizationMembers,
        })),
      },
      accounts: {
        total: totalAccounts,
        byType: accountsByType.map((item) => ({
          type: item.type,
          count: item._count.type,
        })),
      },
      sessions: {
        total: totalSessions,
        active: activeSessions,
        expired: expiredSessions,
      },
      organizations: {
        total: totalOrganizations,
        personal: personalOrgs,
        team: teamOrgs,
        avgMembersPerOrg: Math.round(avgMembersPerOrg * 100) / 100,
        membersByRole: membersByRole.map((item) => ({
          role: item.role,
          count: item._count.role,
        })),
        topByProjects: topOrgsByProjects.map((org) => ({
          id: org.id,
          name: org.name,
          slug: org.slug,
          projectCount: org._count.projects,
        })),
        topByAssets: topOrgsByAssets.map((org) => ({
          id: org.id,
          name: org.name,
          slug: org.slug,
          assetCount: org._count.assets,
        })),
        all: allOrganizations.map((org) => ({
          id: org.id,
          name: org.name,
          slug: org.slug,
          isPersonal: org.isPersonal,
          createdAt: org.createdAt,
          memberCount: org._count.members,
          projectCount: org._count.projects,
          assetCount: org._count.assets,
        })),
      },
      projects: {
        total: totalProjects,
        published: publishedProjects,
        public: publicProjects,
        withThumbnail: projectsWithThumbnail,
        withPublishedUrl: projectsWithPublishedUrl,
        recent: recentProjects,
        byEngine: projectsByEngine.map((item) => ({
          engine: item.engine,
          count: item._count.engine,
        })),
      },
      assets: {
        total: totalAssets,
        withProjects: assetsWithProjects,
        withThumbnail: assetsWithThumbnail,
        withMetadata: assetsWithMetadata,
        cesiumIonAssets,
        cesiumIonAssetsWithApiKey,
        byType: assetsByType.map((item) => ({
          type: item.assetType,
          count: item._count.assetType,
        })),
        byFileType: assetsByFileType.map((item) => ({
          fileType: item.fileType,
          count: item._count.fileType,
        })),
      },
      subscriptions: {
        total: totalSubscriptions,
        active: activeSubscriptions,
        expired: expiredSubscriptions,
        byStatus: subscriptionsByStatus.map((item) => ({
          status: item.status,
          count: item._count.status,
        })),
        byPlan: subscriptionsByPlan.map((item) => ({
          planId: item.planId,
          count: item._count.planId,
        })),
      },
      activities: {
        total: totalActivities,
        recent: recentActivities,
        withMetadata: activitiesWithMetadata,
        withMessage: activitiesWithMessage,
        projectLevel: projectLevelActivities,
        orgLevel: orgLevelActivities,
        byType: activitiesByType.map((item) => ({
          entityType: item.entityType,
          count: item._count.entityType,
        })),
        byAction: activitiesByAction.map((item) => ({
          action: item.action,
          count: item._count.action,
        })),
        byDay: activitiesByDay,
      },
      verificationTokens: {
        total: totalVerificationTokens,
      },
    });
  } catch (error) {
    console.error("[Admin Stats API] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch statistics",
      },
      { status: 500 }
    );
  }
}

