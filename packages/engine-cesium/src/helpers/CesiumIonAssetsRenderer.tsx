"use client";

import React, { useEffect, useRef } from "react";
import { useSceneStore } from "@klorad/core";
import {
  loadTilesetWithTransform,
  reapplyTransformAfterReady,
  waitForTilesetReady,
  positionCameraForTileset,
} from "../utils/tileset-operations";

interface TilesetWrapper {
  id: string;
  tileset: any;
  dispose: () => void;
}

const CesiumIonAssetsRenderer: React.FC = () => {
  const tilesetRefs = useRef<Map<string, TilesetWrapper>>(new Map());
  const cesiumIonAssets = useSceneStore((state) => state.cesiumIonAssets);
  const { cesiumViewer, cesiumInstance } = useSceneStore();

  // Create a stable key that includes transform data to trigger re-renders
  const assetsKey = React.useMemo(() => {
    return cesiumIonAssets
      .map((asset) => {
        const transformKey = asset.transform?.matrix
          ? asset.transform.matrix.slice(12, 15).join(',') // Use translation part as key
          : 'no-transform';
        return `${asset.id}-${asset.enabled}-${transformKey}`;
      })
      .join('|');
  }, [cesiumIonAssets]);

  useEffect(() => {
    return () => {
      tilesetRefs.current.forEach((wrapper) => {
        wrapper.dispose();
      });
      tilesetRefs.current.clear();
    };
  }, []);

  useEffect(() => {
    if (!cesiumViewer || !cesiumInstance) {
      return;
    }

    console.log("[CesiumIonAssetsRenderer] Effect triggered, cesiumIonAssets:", {
      count: cesiumIonAssets.length,
      assets: cesiumIonAssets.map((asset) => ({
        id: asset.id,
        name: asset.name,
        assetId: asset.assetId,
        enabled: asset.enabled,
        hasTransform: !!asset.transform,
        transform: asset.transform
          ? {
              hasMatrix: !!asset.transform.matrix,
              matrixLength: asset.transform.matrix?.length,
              longitude: asset.transform.longitude,
              latitude: asset.transform.latitude,
              height: asset.transform.height,
            }
          : null,
      })),
    });

    tilesetRefs.current.forEach((wrapper) => {
      wrapper.dispose();
    });
    tilesetRefs.current.clear();

    cesiumIonAssets.forEach((asset) => {
      if (asset.enabled) {
        initializeAsset(asset);
      }
    });
  }, [assetsKey, cesiumViewer, cesiumInstance]); // Use assetsKey instead of cesiumIonAssets

  const initializeAsset = async (asset: any) => {
    try {
      console.log("[CesiumIonAssetsRenderer] Initializing asset:", {
        assetId: asset.assetId,
        name: asset.name,
        hasTransform: !!asset.transform,
        transform: asset.transform
          ? {
              hasMatrix: !!asset.transform.matrix,
              matrixLength: asset.transform.matrix?.length,
              longitude: asset.transform.longitude,
              latitude: asset.transform.latitude,
              height: asset.transform.height,
              matrixPreview: asset.transform.matrix
                ?.slice(12, 15)
                .map((v: number) => v.toFixed(2))
                .join(", "),
            }
          : null,
      });

      const originalToken = cesiumInstance.Ion.defaultAccessToken;
      cesiumInstance.Ion.defaultAccessToken = asset.apiKey;

      // Load tileset with transform (uses shared utility function)
      // This applies transform before adding to scene
      const tileset = await loadTilesetWithTransform(
        cesiumInstance,
        asset.assetId,
        undefined, // metadata not available here, transform already extracted in useAssetManager
        asset.transform,
        {
          viewer: cesiumViewer,
          log: true,
        }
      );

      if (!tileset) {
        throw new Error("Failed to create tileset - tileset is null/undefined");
      }

      tileset.assetId = parseInt(asset.assetId);

      console.log("[CesiumIonAssetsRenderer] Tileset loaded, modelMatrix:", {
        hasModelMatrix: !!tileset.modelMatrix,
        modelMatrixPreview: tileset.modelMatrix
          ? [
              tileset.modelMatrix[12],
              tileset.modelMatrix[13],
              tileset.modelMatrix[14],
            ]
              .map((v: number) => v.toFixed(2))
              .join(", ")
          : null,
      });

      cesiumViewer.scene.primitives.add(tileset);
      const wrapper: TilesetWrapper = {
        id: asset.id,
        tileset,
        dispose: () => {
          try {
            if (
              cesiumViewer &&
              cesiumViewer.scene &&
              cesiumViewer.scene.primitives
            ) {
              cesiumViewer.scene.primitives.remove(tileset);
            }
          } catch (_error) {
            // Ignore primitive removal errors
          }
        },
      };

      tilesetRefs.current.set(asset.id, wrapper);

      // Wait for tileset to be ready, then re-apply transform
      // (Cesium sometimes resets it after ready)
      waitForTilesetReady(tileset)
        .then(() => {
          console.log(
            "[CesiumIonAssetsRenderer] Tileset ready, re-applying transform"
          );

          // Re-apply transform after ready (same logic as CesiumMinimalViewer)
          if (asset.transform) {
            reapplyTransformAfterReady(
              cesiumInstance,
              tileset,
              asset.transform,
              {
                viewer: cesiumViewer,
                log: true,
              }
            );

            console.log(
              "[CesiumIonAssetsRenderer] Transform re-applied, positioning camera"
            );

            // Use positionCameraForTileset instead of flyTo(tileset)
            // This respects the transform position, not the original tileset location
            positionCameraForTileset(
              cesiumViewer,
              cesiumInstance,
              asset.transform,
              {
                offset: 1000,
                duration: 2.0,
                pitch: -45,
              }
            );
          } else {
            console.log(
              "[CesiumIonAssetsRenderer] No transform, using default flyTo"
            );
            // Fallback to default flyTo if no transform
            try {
              cesiumViewer.flyTo(tileset, {
                duration: 2.0,
                offset: new cesiumInstance.HeadingPitchRange(0, -0.5, 1000),
              });
            } catch (_error) {
              // Ignore flyTo errors
            }
          }
        })
        .catch((_error: any) => {
          console.error(
            "[CesiumIonAssetsRenderer] Error waiting for tileset ready:",
            _error
          );
        });

      cesiumInstance.Ion.defaultAccessToken = originalToken;
    } catch (error: any) {
      console.error("[CesiumIonAssetsRenderer] Error initializing asset:", {
        assetId: asset.assetId,
        name: asset.name,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  };

  const enabledAssets = cesiumIonAssets.filter((asset) => asset.enabled);
  if (enabledAssets.length === 0) {
    return null;
  }

  return null;
};

export default CesiumIonAssetsRenderer;
