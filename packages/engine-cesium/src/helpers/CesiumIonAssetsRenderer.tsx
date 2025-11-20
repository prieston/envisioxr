"use client";

import React, { useEffect, useRef } from "react";
import { useSceneStore } from "@envisio/core";

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
    console.log("[CesiumIonAssetsRenderer] Initializing asset:", {
      id: asset.id,
      assetId: asset.assetId,
      name: asset.name,
      enabled: asset.enabled,
      apiKey: asset.apiKey ? "***" : "missing",
    });

    try {
      const originalToken = cesiumInstance.Ion.defaultAccessToken;
      cesiumInstance.Ion.defaultAccessToken = asset.apiKey;

      const parsedAssetId = parseInt(asset.assetId);
      console.log(
        "[CesiumIonAssetsRenderer] Creating tileset from assetId:",
        parsedAssetId,
        "(original:",
        asset.assetId,
        ", type:",
        typeof asset.assetId,
        ")"
      );

      const tileset =
        await cesiumInstance.Cesium3DTileset.fromIonAssetId(parsedAssetId);

      if (!tileset) {
        throw new Error("Failed to create tileset - tileset is null/undefined");
      }

      console.log(
        "[CesiumIonAssetsRenderer] Tileset created, setting assetId:",
        parsedAssetId
      );
      tileset.assetId = parsedAssetId;
      console.log(
        "[CesiumIonAssetsRenderer] Tileset assetId after setting:",
        tileset.assetId,
        "(type:",
        typeof tileset.assetId,
        ")"
      );

      cesiumViewer.scene.primitives.add(tileset);
      console.log(
        "[CesiumIonAssetsRenderer] Tileset added to primitives. Total primitives:",
        cesiumViewer.scene.primitives.length
      );

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
              console.log(
                "[CesiumIonAssetsRenderer] Disposing tileset with assetId:",
                tileset.assetId
              );
              cesiumViewer.scene.primitives.remove(tileset);
            }
          } catch (_error) {
            // Ignore primitive removal errors
          }
        },
      };

      tilesetRefs.current.set(asset.id, wrapper);
      console.log(
        "[CesiumIonAssetsRenderer] Wrapper stored. Total wrappers:",
        tilesetRefs.current.size
      );

      if (tileset.readyPromise) {
        console.log(
          "[CesiumIonAssetsRenderer] Waiting for tileset readyPromise..."
        );
        tileset.readyPromise
          .then(() => {
            console.log(
              "[CesiumIonAssetsRenderer] Tileset ready, attempting auto flyTo with assetId:",
              tileset.assetId
            );
            try {
              cesiumViewer.flyTo(tileset, {
                duration: 2.0,
                offset: new cesiumInstance.HeadingPitchRange(0, -0.5, 1000),
              });
              console.log(
                "[CesiumIonAssetsRenderer] Auto flyTo completed successfully"
              );
            } catch (error) {
              console.error(
                "[CesiumIonAssetsRenderer] Error in auto flyTo:",
                error
              );
            }
          })
          .catch((error: any) => {
            console.error(
              "[CesiumIonAssetsRenderer] Tileset readyPromise rejected:",
              error
            );
          });
      } else {
        console.warn("[CesiumIonAssetsRenderer] Tileset has no readyPromise");
      }

      cesiumInstance.Ion.defaultAccessToken = originalToken;
      console.log(
        "[CesiumIonAssetsRenderer] Asset initialization completed successfully"
      );
    } catch (error: any) {
      console.error(
        "[CesiumIonAssetsRenderer] Error initializing asset:",
        error
      );
      console.error("[CesiumIonAssetsRenderer] Asset details:", {
        id: asset.id,
        assetId: asset.assetId,
        name: asset.name,
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
