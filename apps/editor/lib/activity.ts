import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type ActivityEntityType =
  | "PROJECT"
  | "MODEL"
  | "GEOSPATIAL_ASSET"
  | "SENSOR"
  | "DATA_SOURCE"
  | "ORGANIZATION"
  | "USER";

export type ActivityActionType =
  | "CREATED"
  | "UPDATED"
  | "DELETED"
  | "RENAMED"
  | "PUBLISHED"
  | "ARCHIVED"
  | "ADDED"
  | "REMOVED";

interface LogActivityParams {
  organizationId: string;
  projectId?: string | null; // null = org-level activity
  actorId: string; // User.id who performed the action
  entityType: ActivityEntityType;
  entityId: string;
  action: ActivityActionType;
  message?: string; // optional pre-rendered message
  metadata?: Record<string, unknown>; // structured details for rich UI
}

/**
 * Helper function to log activities
 * Append-only activity log for tracking user actions across the platform
 *
 * @example
 * // Log model upload
 * await logActivity({
 *   organizationId: org.id,
 *   projectId: project.id, // or null for org-level
 *   actorId: user.id,
 *   entityType: "MODEL",
 *   entityId: asset.id,
 *   action: "CREATED",
 *   message: `Model "${asset.name}" uploaded`,
 *   metadata: { assetName: asset.name, fileSize: asset.fileSize }
 * });
 */
export async function logActivity({
  organizationId,
  projectId,
  actorId,
  entityType,
  entityId,
  action,
  message,
  metadata,
}: LogActivityParams): Promise<void> {
  try {
    await prisma.activity.create({
      data: {
        organizationId,
        projectId: projectId || null,
        actorId,
        entityType,
        entityId,
        action,
        message: message || null,
        metadata: (metadata || {}) as Prisma.InputJsonValue,
      },
    });
  } catch (error) {
    // Don't throw - activity logging shouldn't break the main operation
    console.error("Failed to log activity:", error);
  }
}

