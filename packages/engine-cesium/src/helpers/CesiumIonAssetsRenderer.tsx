"use client";

import React, { useEffect, useRef } from "react";
import { useSceneStore } from "@envisio/core/state";

interface TilesetWrapper {
  id: string;
  tileset: any;
  dispose: () => void;
}

const CesiumIonAssetsRenderer: React.FC = () => {
  const tilesetRefs = useRef<Map<string, TilesetWrapper>>(new Map());
  const cesiumIonAssets = useSceneStore((state) => state.cesiumIonAssets);
  const { cesiumViewer, cesiumInstance } = useSceneStore();

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
  }, [cesiumIonAssets, cesiumViewer, cesiumInstance]);

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
          } catch (_error) {}
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
            } catch (_error) {}
          })
          .catch((_error: any) => {});
      }

      cesiumInstance.Ion.defaultAccessToken = originalToken;
    } catch (error: any) {}
  };

  const enabledAssets = cesiumIonAssets.filter((asset) => asset.enabled);
  if (enabledAssets.length === 0) {
    return null;
  }

  return null;
};

export default CesiumIonAssetsRenderer;
