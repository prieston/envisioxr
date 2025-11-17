import { useEffect, useRef } from "react";
import useModels from "./useModels";
import { updateModelMetadata } from "@/app/utils/api";
import { useCesiumIonUpload } from "@envisio/engine-cesium";

/**
 * Hook to poll tiling status for Cesium Ion assets that are IN_PROGRESS
 * Updates asset metadata when tiling completes
 */
export const useTilingStatusPolling = () => {
  const { models, mutate } = useModels({ assetType: "cesiumIonAsset" });
  const { pollAssetStatus } = useCesiumIonUpload();
  const pollingRefs = useRef<Map<string, boolean>>(new Map());

  useEffect(() => {
    // Find all assets that are IN_PROGRESS
    const inProgressAssets = models.filter((asset) => {
      if (asset.assetType !== "cesiumIonAsset" || !asset.cesiumAssetId || !asset.cesiumApiKey) {
        return false;
      }
      const metadata = asset.metadata as Record<string, any> | undefined;
      const tilingStatus = metadata?.tilingStatus;
      return tilingStatus === "IN_PROGRESS";
    });

    // Start polling for each IN_PROGRESS asset
    inProgressAssets.forEach((asset) => {
      const assetId = asset.id;
      const cesiumAssetId = asset.cesiumAssetId!;
      const apiKey = asset.cesiumApiKey!;

      // Skip if already polling
      if (pollingRefs.current.get(assetId)) {
        return;
      }

      // Mark as polling
      pollingRefs.current.set(assetId, true);

      // Start polling (don't await - let it run in background)
      pollAssetStatus(Number(cesiumAssetId), apiKey, async (_status, _percent) => {
        // Update progress periodically
        try {
          await updateModelMetadata(assetId, {
            metadata: {
              ...(asset.metadata as Record<string, any>),
              tilingProgress: _percent,
            },
          });
          // Refresh assets list to show updated progress
          mutate();
        } catch (err) {
          // Silently fail - progress updates are not critical
                // Failed to update tiling progress
        }
      })
        .then(async (assetInfo) => {
          // Update asset metadata when tiling completes
          try {
            await updateModelMetadata(assetId, {
              metadata: {
                ...(asset.metadata as Record<string, any>),
                tilingStatus: "COMPLETE",
                tilingProgress: 100,
                type: assetInfo.type,
                status: assetInfo.status,
                bytes: assetInfo.bytes,
              },
            });
            // Refresh assets list
            mutate();
          } catch (err) {
            console.error("Failed to update tiling status:", err);
          } finally {
            pollingRefs.current.delete(assetId);
          }
        })
        .catch(async (err) => {
          // Polling error
          // Update status to ERROR
          try {
            await updateModelMetadata(assetId, {
              metadata: {
                ...(asset.metadata as Record<string, any>),
                tilingStatus: "ERROR",
                error: err.message,
              },
            });
            mutate();
          } catch (updateErr) {
            // Failed to update error status
          } finally {
            pollingRefs.current.delete(assetId);
          }
        });
    });

    // Cleanup function
    return () => {
      // Cleanup is handled by the polling promises themselves
    };
  }, [models, mutate]);
};

