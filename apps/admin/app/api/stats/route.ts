import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { isGodUser } from "@/lib/config/godusers";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
      totalActivities,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.organization.count(),
      prisma.project.count(),
      prisma.asset.count(),
      prisma.activity.count(),
    ]);

    // Get organization statistics
    const personalOrgs = await prisma.organization.count({
      where: { isPersonal: true },
    });

    const teamOrgs = await prisma.organization.count({
      where: { isPersonal: false },
    });

    const orgsByPlan = await prisma.organization.groupBy({
      by: ["planCode"],
      _count: { planCode: true },
    });

    // Get all organizations with details
    const allOrganizations = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        isPersonal: true,
        planCode: true,
        subscriptionStatus: true,
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

    // Get all users with details
    // Note: User model doesn't have createdAt field, so we order by id instead
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        _count: {
          select: {
            organizationMembers: true,
            activities: true,
          },
        },
      },
      orderBy: { id: "desc" },
    });

    // Calculate total storage
    const allAssets = await prisma.asset.findMany({
      select: {
        fileSize: true,
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
      }
    });

    const totalStorageGB = totalStorageBytes / (1024 * 1024 * 1024);

    return NextResponse.json({
      overview: {
        totalUsers,
        totalOrganizations,
        totalProjects,
        totalAssets,
        totalActivities,
        totalStorageGB,
      },
      organizations: {
        total: totalOrganizations,
        personal: personalOrgs,
        team: teamOrgs,
        byPlan: orgsByPlan.map((item) => ({
          planCode: item.planCode,
          count: item._count.planCode,
        })),
        all: allOrganizations.map((org) => ({
          id: org.id,
          name: org.name,
          slug: org.slug,
          isPersonal: org.isPersonal,
          planCode: org.planCode,
          subscriptionStatus: org.subscriptionStatus,
          memberCount: org._count.members,
          projectCount: org._count.projects,
          assetCount: org._count.assets,
          createdAt: org.createdAt,
        })),
      },
      users: {
        total: totalUsers,
        all: allUsers.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          organizationCount: user._count.organizationMembers,
          activityCount: user._count.activities,
        })),
      },
    });
  } catch (error) {
    console.error("[Admin Stats API] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

