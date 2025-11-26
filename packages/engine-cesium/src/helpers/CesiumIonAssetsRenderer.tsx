"use client";

import React, { useEffect, useRef } from "react";
import { useSceneStore } from "@klorad/core";
import { applyTransformToTileset } from "../utils/tileset-operations";

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
      const originalToken = cesiumInstance.Ion.defaultAccessToken;
      cesiumInstance.Ion.defaultAccessToken = asset.apiKey;

      const tileset = await cesiumInstance.Cesium3DTileset.fromIonAssetId(
        parseInt(asset.assetId)
      );

      if (!tileset) {
        throw new Error("Failed to create tileset - tileset is null/undefined");
      }

      tileset.assetId = parseInt(asset.assetId);

      // Apply transform using professional utility
      const transformApplied = applyTransformToTileset(
        cesiumInstance,
        tileset,
        asset.transform,
        {
          viewer: cesiumViewer,
          requestRender: false, // Will render after adding to scene
          log: true,
        }
      );

      if (!transformApplied) {      }

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

      if (tileset.readyPromise) {
        tileset.readyPromise
          .then(() => {
            try {
              cesiumViewer.flyTo(tileset, {
                duration: 2.0,
                offset: new cesiumInstance.HeadingPitchRange(0, -0.5, 1000),
              });
            } catch (_error) {
              // Ignore flyTo errors
            }
          })
          .catch((_error: any) => {
            // Ignore tileset ready promise errors
          });
      }

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
