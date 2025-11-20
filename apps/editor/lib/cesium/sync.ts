/**
 * Cesium Ion sync utilities
 */

import { decryptToken } from "./encryption";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const CESIUM_ION_API_BASE = "https://api.cesium.com/v1";

export interface SyncResult {
  addedCount: number;
  updatedCount: number;
  deletedCount: number;
  totalCesiumAssets: number;
  totalLocalAssets: number;
}

export interface CesiumAssetResponse {
  id: string | number; // Cesium Ion API returns id as number, but we store as string
  name: string;
  type?: string;
  description?: string;
  attributions?: unknown;
  bytes?: number;
  dateAdded?: string;
  status?: string;
  options?: unknown;
  [key: string]: unknown;
}

/**
 * Fetch all assets from Cesium Ion for a given token
 */
async function fetchCesiumAssets(
  readToken: string
): Promise<CesiumAssetResponse[]> {
  const assets: CesiumAssetResponse[] = [];
  let link: string | null = `${CESIUM_ION_API_BASE}/assets?limit=100`;

  // Cesium Ion API uses Link header for pagination (RFC 5988)
  while (link) {
    const response = await fetch(link, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${readToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Cesium assets: ${response.statusText}`);
    }

    const data = await response.json();
    const pageAssets = data.items || data.assets || [];

    if (pageAssets.length === 0) {
      break;
    }

    assets.push(...pageAssets);

    // Check for next page link in Link header
    const linkHeader = response.headers.get("Link");
    if (linkHeader) {
      // Parse Link header: <url>; rel="next"
      const nextLinkMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
      link = nextLinkMatch ? nextLinkMatch[1] : null;
    } else {
      // Fallback: check if we got fewer items than limit
      if (pageAssets.length < 100) {
        break;
      }
      // Try next page number (fallback if no Link header)
      const currentPage = parseInt(
        new URL(link).searchParams.get("page") || "1"
      );
      link = `${CESIUM_ION_API_BASE}/assets?page=${currentPage + 1}&limit=100`;
      // Safety check to prevent infinite loops
      if (currentPage > 1000) {
        console.warn("Reached max pages limit for Cesium assets");
        break;
      }
    }
  }

  return assets;
}

/**
 * Sync Cesium Ion assets for an integration
 */
export async function syncCesiumAssets(
  integrationId: string,
  organizationId: string
): Promise<SyncResult> {
  // Get integration with decrypted read token
  const integration = await prisma.cesiumIonIntegration.findUnique({
    where: { id: integrationId },
  });

  if (!integration) {
    throw new Error("Integration not found");
  }

  if (integration.organizationId !== organizationId) {
    throw new Error("Integration does not belong to organization");
  }

  if (!integration.readTokenValid) {
    throw new Error("Read token is not valid");
  }

  // Decrypt read token
  const readToken = decryptToken(integration.readToken);

  // Fetch assets from Cesium Ion
  const cesiumAssets = await fetchCesiumAssets(readToken);

  // Get existing local CesiumAsset entries
  const localCesiumAssets = await prisma.cesiumAsset.findMany({
    where: {
      integrationId,
      organizationId,
    },
  });

  // Get existing Asset entries for this organization with cesiumAssetId
  const existingAssets = await prisma.asset.findMany({
    where: {
      organizationId,
      assetType: "cesiumIonAsset",
      cesiumAssetId: { not: null },
    },
  });

  // Convert cesiumAsset.id to string for comparison and storage
  const cesiumAssetIds = new Set(cesiumAssets.map((a) => String(a.id)));
  const localCesiumAssetMap = new Map(
    localCesiumAssets.map((a) => [a.cesiumAssetId, a])
  );
  const existingAssetMap = new Map(
    existingAssets
      .filter((a) => a.cesiumAssetId)
      .map((a) => [a.cesiumAssetId!, a])
  );

  let addedCount = 0;
  let updatedCount = 0;
  let deletedCount = 0;

  // Upsert assets from Cesium
  for (const cesiumAsset of cesiumAssets) {
    const cesiumAssetIdStr = String(cesiumAsset.id);
    const existingCesiumAsset = localCesiumAssetMap.get(cesiumAssetIdStr);

    if (existingCesiumAsset) {
      // Check if anything actually changed before updating
      const nameChanged = existingCesiumAsset.name !== cesiumAsset.name;
      const typeChanged =
        existingCesiumAsset.type !== (cesiumAsset.type || null);
      const attributionsChanged =
        JSON.stringify(existingCesiumAsset.attributions) !==
        JSON.stringify(
          cesiumAsset.attributions ? (cesiumAsset.attributions as object) : null
        );
      const statusChanged = existingCesiumAsset.status !== "active";

      if (nameChanged || typeChanged || attributionsChanged || statusChanged) {
        // Update existing CesiumAsset entry only if something changed
        await prisma.cesiumAsset.update({
          where: { id: existingCesiumAsset.id },
          data: {
            name: cesiumAsset.name,
            type: cesiumAsset.type || null,
            attributions: cesiumAsset.attributions
              ? (cesiumAsset.attributions as object)
              : null,
            status: "active",
            updatedAt: new Date(),
          },
        });
        updatedCount++;
      }
    } else {
      // Create new CesiumAsset entry
      await prisma.cesiumAsset.create({
        data: {
          organizationId,
          integrationId,
          cesiumAssetId: cesiumAssetIdStr,
          name: cesiumAsset.name,
          type: cesiumAsset.type || null,
          attributions: cesiumAsset.attributions
            ? (cesiumAsset.attributions as object)
            : null,
          status: "active",
        },
      });
      addedCount++;
    }

    // Also create/update Asset entry for library if it doesn't exist
    const existingLibraryAsset = existingAssetMap.get(cesiumAssetIdStr);

    // Build comprehensive metadata object from Cesium asset response
    const assetMetadata: Record<string, unknown> = {};
    if (cesiumAsset.attributions) {
      assetMetadata.attributions = cesiumAsset.attributions;
    }
    if (cesiumAsset.bytes !== undefined) {
      assetMetadata.bytes = cesiumAsset.bytes;
    }
    if (cesiumAsset.dateAdded) {
      assetMetadata.dateAdded = cesiumAsset.dateAdded;
    }
    if (cesiumAsset.status) {
      assetMetadata.status = cesiumAsset.status;
    }
    if (cesiumAsset.options) {
      assetMetadata.options = cesiumAsset.options;
    }
    // Include any other fields that might be useful
    if (cesiumAsset.type) {
      assetMetadata.type = cesiumAsset.type;
    }

    if (!existingLibraryAsset) {
      // Create Asset entry so it appears in the library
      await prisma.asset.create({
        data: {
          organizationId,
          assetType: "cesiumIonAsset",
          cesiumAssetId: cesiumAssetIdStr,
          cesiumApiKey: readToken, // Store the read token as API key
          name: cesiumAsset.name,
          originalFilename: cesiumAsset.name,
          fileUrl: `cesium-ion://${cesiumAssetIdStr}`, // Placeholder URL for Cesium Ion assets
          fileType: cesiumAsset.type || "3DTILES",
          description: cesiumAsset.description || null,
          metadata:
            Object.keys(assetMetadata).length > 0
              ? (assetMetadata as Prisma.InputJsonValue)
              : null,
          fileSize: cesiumAsset.bytes ? BigInt(cesiumAsset.bytes) : null,
        },
      });
    } else {
      // Check if anything actually changed before updating library asset
      const nameChanged = existingLibraryAsset.name !== cesiumAsset.name;
      const descriptionChanged =
        existingLibraryAsset.description !== (cesiumAsset.description || null);
      const metadataChanged =
        JSON.stringify(existingLibraryAsset.metadata) !==
        JSON.stringify(
          Object.keys(assetMetadata).length > 0 ? assetMetadata : null
        );
      const fileSizeChanged =
        existingLibraryAsset.fileSize?.toString() !==
        (cesiumAsset.bytes ? BigInt(cesiumAsset.bytes).toString() : null);

      if (
        nameChanged ||
        descriptionChanged ||
        metadataChanged ||
        fileSizeChanged
      ) {
        // Update existing library asset only if something changed
        await prisma.asset.update({
          where: { id: existingLibraryAsset.id },
          data: {
            name: cesiumAsset.name,
            description: cesiumAsset.description || null,
            metadata:
              Object.keys(assetMetadata).length > 0
                ? (assetMetadata as Prisma.InputJsonValue)
                : null,
            fileSize: cesiumAsset.bytes ? BigInt(cesiumAsset.bytes) : null,
          },
        });
      }
    }
  }

  // Mark CesiumAsset entries that no longer exist in Cesium as deleted
  for (const localCesiumAsset of localCesiumAssets) {
    if (!cesiumAssetIds.has(localCesiumAsset.cesiumAssetId)) {
      // Only count as deleted if it wasn't already marked as deleted
      if (localCesiumAsset.status !== "deleted") {
        await prisma.cesiumAsset.update({
          where: { id: localCesiumAsset.id },
          data: {
            status: "deleted",
            updatedAt: new Date(),
          },
        });
        deletedCount++;
      }
    }
  }

  // Update lastSyncedAt
  await prisma.cesiumIonIntegration.update({
    where: { id: integrationId },
    data: {
      lastSyncedAt: new Date(),
    },
  });

  return {
    addedCount,
    updatedCount,
    deletedCount,
    totalCesiumAssets: cesiumAssets.length,
    totalLocalAssets: localCesiumAssets.length,
  };
}
