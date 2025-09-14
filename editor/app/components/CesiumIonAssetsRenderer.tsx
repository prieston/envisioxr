"use client";

import React, { useEffect, useRef } from "react";
import useSceneStore from "../hooks/useSceneStore";

interface TilesetWrapper {
  id: string;
  tileset: any;
  dispose: () => void;
}

const CesiumIonAssetsRenderer: React.FC = () => {
  const tilesetRefs = useRef<Map<string, TilesetWrapper>>(new Map());
  const cesiumIonAssets = useSceneStore((state) => state.cesiumIonAssets);
  const { cesiumViewer, cesiumInstance } = useSceneStore();

  // Clean up tilesets when component unmounts or assets change
  useEffect(() => {
    return () => {
      tilesetRefs.current.forEach((wrapper) => {
        wrapper.dispose();
      });
      tilesetRefs.current.clear();
    };
  }, []);

  // Initialize assets when they change
  useEffect(() => {
    if (!cesiumViewer || !cesiumInstance) {
      console.log("[CesiumIon] Cesium viewer or instance not available");
      return;
    }

    // Clear existing assets
    tilesetRefs.current.forEach((wrapper) => {
      wrapper.dispose();
    });
    tilesetRefs.current.clear();

    // Initialize new assets
    cesiumIonAssets.forEach((asset) => {
      if (asset.enabled) {
        initializeAsset(asset);
      }
    });
  }, [cesiumIonAssets, cesiumViewer, cesiumInstance]);

  const initializeAsset = async (asset: any) => {
    try {
      console.log(
        "[CesiumIon] Initializing asset",
        asset.assetId,
        "with key",
        asset.apiKey
      );

      // Set the API key for this specific asset
      const originalToken = cesiumInstance.Ion.defaultAccessToken;
      cesiumInstance.Ion.defaultAccessToken = asset.apiKey;

      // Create tileset using Cesium's recommended pattern
      const tileset = await cesiumInstance.Cesium3DTileset.fromIonAssetId(
        parseInt(asset.assetId)
      );

      // Validate that the tileset was created successfully
      if (!tileset) {
        throw new Error("Failed to create tileset - tileset is null/undefined");
      }

      // Set the assetId property for easy identification
      tileset.assetId = parseInt(asset.assetId);

      // Add the tileset to the scene using Cesium's recommended pattern
      cesiumViewer.scene.primitives.add(tileset);

      // Create wrapper for cleanup
      const wrapper: TilesetWrapper = {
        id: asset.id,
        tileset,
        dispose: () => {
          try {
            if (cesiumViewer && cesiumViewer.scene && cesiumViewer.scene.primitives) {
              cesiumViewer.scene.primitives.remove(tileset);
            }
          } catch (error) {
            console.warn("[CesiumIon] Error removing tileset:", error);
          }
        },
      };

      tilesetRefs.current.set(asset.id, wrapper);

      // Set up event listeners
      if (tileset.readyPromise) {
        tileset.readyPromise
          .then(() => {
            console.log("[CesiumIon] Tileset ready for asset", asset.assetId);

            // Auto-center camera on the tileset using Cesium's built-in method
            try {
              cesiumViewer.flyTo(tileset, {
                duration: 2.0,
                offset: new cesiumInstance.HeadingPitchRange(0, -0.5, 1000),
              });
              console.log(
                "[CesiumIon] Camera centered on asset:",
                asset.assetId
              );
            } catch (error) {
              console.warn(
                "[CesiumIon] Error centering camera on asset:",
                asset.assetId,
                error
              );
            }
          })
          .catch((error: any) => {
            console.error("[CesiumIon] Error loading tileset:", error);
          });
      } else {
        console.warn(
          "[CesiumIon] Tileset does not have readyPromise, skipping auto-center"
        );
      }

      // Restore original token
      cesiumInstance.Ion.defaultAccessToken = originalToken;

      console.log("[CesiumIon] Initialized asset", asset.assetId);
    } catch (error: any) {
      console.error(
        "[CesiumIon] Error initializing asset",
        asset.assetId,
        error
      );
    }
  };

  const enabledAssets = cesiumIonAssets.filter((asset) => asset.enabled);

  if (enabledAssets.length === 0) {
    return null;
  }

  return null; // This component doesn't render anything visible
};

export default CesiumIonAssetsRenderer;
