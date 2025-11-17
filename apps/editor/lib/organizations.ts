// lib/organizations.ts
import { prisma } from "@/lib/prisma";
import { OrganizationRole } from "@prisma/client";

/**
 * Get all organizations a user is a member of
 */
export async function getUserOrganizations(userId: string) {
  return prisma.organizationMember.findMany({
    where: { userId },
    include: {
      organization: true,
    },
  });
}

/**
 * Get a user's personal organization (isPersonal = true)
 */
export async function getUserPersonalOrganization(userId: string) {
  const member = await prisma.organizationMember.findFirst({
    where: {
      userId,
      organization: {
        isPersonal: true,
      },
    },
    include: {
      organization: true,
    },
  });

  return member?.organization || null;
}

/**
 * Get organization IDs where user has a specific role or higher
 * Roles hierarchy: owner > admin > member > publicViewer
 */
export async function getUserOrganizationIds(
  userId: string,
  minRole: OrganizationRole = "member"
) {
  const roleHierarchy: Record<OrganizationRole, number> = {
    publicViewer: -1,
    member: 0,
    admin: 1,
    owner: 2,
  };

  const minRoleLevel = roleHierarchy[minRole];

  const members = await prisma.organizationMember.findMany({
    where: { userId },
    include: { organization: true },
  });

  return members
    .filter((member) => roleHierarchy[member.role] >= minRoleLevel)
    .map((member) => member.organizationId);
}

/**
 * Check if user is a member of an organization
 */
export async function isUserMemberOfOrganization(
  userId: string,
  organizationId: string
): Promise<boolean> {
  const member = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId,
      },
    },
  });

  return !!member;
}

/**
 * Check if user has a specific role (or higher) in an organization
 */
export async function hasUserRoleInOrganization(
  userId: string,
  organizationId: string,
  requiredRole: OrganizationRole = "member"
): Promise<boolean> {
  const member = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId,
      },
    },
  });

  if (!member) return false;

  const roleHierarchy: Record<OrganizationRole, number> = {
    publicViewer: -1,
    member: 0,
    admin: 1,
    owner: 2,
  };

  return roleHierarchy[member.role] >= roleHierarchy[requiredRole];
}

/**
 * Get user's default organization (personal org, or first org they're a member of)
 */
export async function getUserDefaultOrganization(userId: string) {
  // Try to get personal organization first
  const personalOrg = await getUserPersonalOrganization(userId);
  if (personalOrg) return personalOrg;

  // Otherwise get first organization they're a member of
  const member = await prisma.organizationMember.findFirst({
    where: { userId },
    include: { organization: true },
    orderBy: { createdAt: "asc" },
  });

  return member?.organization || null;
}

/**
 * Check if a user can view a published project
 * Returns true if:
 * - Project is published AND (project is public OR user is a member/publicViewer of the organization)
 * - For personal organizations, published projects are always public
 */
export async function canUserViewPublishedProject(
  userId: string | null,
  project: {
    isPublished: boolean;
    isPublic: boolean;
    organizationId: string;
    organization: { isPersonal: boolean };
  }
): Promise<boolean> {
  // Project must be published
  if (!project.isPublished) {
    return false;
  }

  // For personal organizations, published projects are always public
  if (project.organization.isPersonal) {
    return true;
  }

  // If project is public, anyone can view it
  if (project.isPublic) {
    return true;
  }

  // If project is private, user must be authenticated and have access
  if (!userId) {
    return false;
  }

  // Check if user is a member or publicViewer of the organization
  return isUserMemberOfOrganization(userId, project.organizationId);
}

