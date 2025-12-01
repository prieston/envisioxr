import { useEffect, useRef } from "react";
import { useTileset } from "../hooks/useTileset";
import { useTransform } from "../hooks/useTransform";
import { useCameraPosition } from "../hooks/useCameraPosition";
import { useCameraController } from "../hooks/useCameraController";
import { useTerrain } from "../hooks/useTerrain";
import { LocationNotSetNotification } from "./LocationNotSetNotification";
import type { CesiumModule } from "../types";

interface TilesetRendererProps {
  viewer: any | null;
  Cesium: CesiumModule | null;
  cesiumAssetId: string;
  metadata?: Record<string, unknown> | null;
  initialTransform?: number[];
  enableLocationEditing: boolean;
  enableAtmosphere?: boolean;
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
  enableAtmosphere = false,
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
    enableLocationEditing,
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

  // Track previous visibility state to avoid unnecessary updates
  const visibilityStateRef = useRef<{
    isGeoreferenced?: boolean;
    enableAtmosphere?: boolean;
    hasApplied?: boolean;
  }>({});

  // Update scene visibility based on georeferencing (separate effect to reduce flashing)
  useEffect(() => {
    if (
      !viewer ||
      !Cesium ||
      !tileset ||
      !isReady ||
      enableLocationEditing ||
      assetType === "IMAGERY"
    ) {
      return;
    }

    // Check if viewer is destroyed or scene is not available
    if (viewer.isDestroyed && viewer.isDestroyed()) {
      return;
    }

    if (!viewer.scene) {
      return;
    }

    const prevState = visibilityStateRef.current;
    const shouldUpdate =
      prevState.isGeoreferenced !== isGeoreferenced ||
      prevState.enableAtmosphere !== enableAtmosphere ||
      !prevState.hasApplied;

    if (!shouldUpdate) {
      return;
    }

    // Double-check scene is still valid before accessing properties
    if (!viewer.scene || (viewer.isDestroyed && viewer.isDestroyed())) {
      return;
    }

    if (isGeoreferenced) {
      // Show globe for georeferenced models (only if it's not already shown)
      if (viewer.scene.globe && viewer.scene.globe.show !== true) {
        viewer.scene.globe.show = true;
      }
      // Show skybox and atmosphere based on enableAtmosphere prop
      if (
        viewer.scene.skyBox &&
        viewer.scene.skyBox.show !== enableAtmosphere
      ) {
        viewer.scene.skyBox.show = enableAtmosphere;
      }
      if (
        viewer.scene.skyAtmosphere &&
        viewer.scene.skyAtmosphere.show !== enableAtmosphere
      ) {
        viewer.scene.skyAtmosphere.show = enableAtmosphere;
      }
    } else {
      // Hide globe, skybox, and atmosphere for non-georeferenced models
      // Only hide if not already hidden
      if (viewer.scene.globe && viewer.scene.globe.show !== false) {
        viewer.scene.globe.show = false;
      }
      if (viewer.scene.skyBox && viewer.scene.skyBox.show !== false) {
        viewer.scene.skyBox.show = false;
      }
      if (
        viewer.scene.skyAtmosphere &&
        viewer.scene.skyAtmosphere.show !== false
      ) {
        viewer.scene.skyAtmosphere.show = false;
      }
      // Disable terrain for non-georeferenced models
      if (
        !(viewer.terrainProvider instanceof Cesium.EllipsoidTerrainProvider)
      ) {
        viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
      }
      if (viewer.scene.globe) {
        viewer.scene.globe.depthTestAgainstTerrain = false;
      }
    }

    // Update tracked state
    visibilityStateRef.current = {
      isGeoreferenced,
      enableAtmosphere,
      hasApplied: true,
    };
  }, [
    viewer,
    Cesium,
    tileset,
    isReady,
    enableLocationEditing,
    enableAtmosphere,
    isGeoreferenced,
    assetType,
  ]);

  // Position camera when tileset is ready (separate effect)
  useEffect(() => {
    if (!viewer || !Cesium || !tileset || !isReady || enableLocationEditing) {
      return;
    }

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
    zoomToTileset,
  ]);

  // Configure camera controller
  useCameraController({
    viewer,
    enableLocationEditing,
  });

  // Show notification if model is not georeferenced
  const showNotification =
    !enableLocationEditing && !isGeoreferenced && isReady;

  return <LocationNotSetNotification visible={showNotification} />;
}
