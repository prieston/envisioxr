import { useEffect, useRef } from "react";
import { useTileset } from "../hooks/useTileset";
import { useTransform } from "../hooks/useTransform";
import { useCameraPosition } from "../hooks/useCameraPosition";
import { useCameraController } from "../hooks/useCameraController";
import { useTerrain } from "../hooks/useTerrain";
import type { CesiumModule } from "../types";

interface TilesetRendererProps {
  viewer: any | null;
  Cesium: CesiumModule | null;
  cesiumAssetId: string;
  metadata?: Record<string, unknown> | null;
  initialTransform?: number[];
  enableLocationEditing: boolean;
  assetType?: string;
  onTilesetReady?: (tileset: any) => void;
  onError?: (error: Error) => void;
}

/**
 * Component to handle 3D tileset rendering
 */
export function TilesetRenderer({
  viewer,
  Cesium,
  cesiumAssetId,
  metadata,
  initialTransform,
  enableLocationEditing,
  assetType,
  onTilesetReady,
  onError,
}: TilesetRendererProps) {
  const tilesetRef = useRef<any>(null);

  // Load tileset
  const { tileset, isReady, transformToApply, isGeoreferenced } = useTileset({
    viewer,
    Cesium,
    cesiumAssetId,
    metadata,
    initialTransform,
    onTilesetReady,
    onError,
  });

  // Store tileset in ref for other hooks
  useEffect(() => {
    tilesetRef.current = tileset;
  }, [tileset]);

  // Setup terrain for georeferenced models
  const shouldEnableTerrain =
    enableLocationEditing || (isGeoreferenced && assetType !== "IMAGERY");

  useTerrain({
    viewer,
    Cesium,
    enabled: shouldEnableTerrain,
  });

  // Apply transform
  useTransform({
    viewer,
    Cesium,
    tileset,
    initialTransform,
    enableLocationEditing,
  });

  // Setup camera positioning
  const { zoomToTileset } = useCameraPosition({ viewer, Cesium });

  // Position camera when tileset is ready
  useEffect(() => {
    if (!viewer || !Cesium || !tileset || !isReady || enableLocationEditing) {
      return;
    }

    // Update globe visibility based on georeferencing
    if (assetType !== "IMAGERY") {
      if (isGeoreferenced && !viewer.scene.globe.show) {
        viewer.scene.globe.show = true;
        console.log(
          "[TilesetRenderer] Showing globe for georeferenced model"
        );
      } else if (!isGeoreferenced && viewer.scene.globe.show) {
        viewer.scene.globe.show = false;
        // Disable terrain for non-georeferenced models
        viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
        viewer.scene.globe.depthTestAgainstTerrain = false;
        console.log(
          "[TilesetRenderer] Hiding globe for non-georeferenced model"
        );
      }
    }

    console.log("[TilesetRenderer] Model georeferencing check:", {
      isGeoreferenced,
      hasTransform: !!transformToApply,
      globeShow: viewer.scene.globe.show,
    });

    // Wait for bounding sphere to be calculated
    const waitTime = transformToApply ? 800 : 500;
    setTimeout(() => {
      zoomToTileset(tileset, transformToApply, !isGeoreferenced);
    }, waitTime);
  }, [
    viewer,
    Cesium,
    tileset,
    isReady,
    enableLocationEditing,
    transformToApply,
    isGeoreferenced,
    assetType,
    zoomToTileset,
  ]);

  // Configure camera controller
  useCameraController({
    viewer,
    enableLocationEditing,
  });

  // This component doesn't render anything - it just manages Cesium state
  return null;
}

