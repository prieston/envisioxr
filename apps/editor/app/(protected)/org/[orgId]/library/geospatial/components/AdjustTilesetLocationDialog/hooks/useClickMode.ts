import { useState, useCallback } from "react";
import { restoreTransform } from "../utils/transform-utils";
import type { Location } from "../utils/transform-utils";

interface UseClickModeOptions {
  tilesetRef: React.MutableRefObject<any>;
  cesiumRef: React.MutableRefObject<any>;
  viewerRef: React.MutableRefObject<any>;
  lastConfirmedTransform?: number[];
  onLocationClick: (location: Location, transform: number[]) => void;
  onTransformRestored: (transform: number[], location: Location) => void;
}

export function useClickMode({
  tilesetRef,
  cesiumRef,
  viewerRef,
  lastConfirmedTransform,
  onLocationClick,
  onTransformRestored,
}: UseClickModeOptions) {
  const [clickModeEnabled, setClickModeEnabled] = useState(false);
  const [showPositionConfirm, setShowPositionConfirm] = useState(false);

  const handleLocationClick = useCallback(
    async (
      longitude: number,
      latitude: number,
      height: number,
      matrix: number[]
    ) => {
      if (!clickModeEnabled) {
        return;
      }

      // Ensure Cesium is loaded
      if (!cesiumRef.current) {
        try {
          const Cesium = await import("cesium");
          cesiumRef.current = Cesium;
        } catch (err) {
          console.error(
            "[useClickMode] Failed to load Cesium:",
            err
          );
          return;
        }
      }

      if (!tilesetRef.current || !cesiumRef.current) {
        console.warn("[useClickMode] Missing tileset or cesium ref");
        return;
      }

      // Transform is ALREADY applied by CesiumMinimalViewer
      // We just need to store the matrix and show confirmation
      onLocationClick({ longitude, latitude, height }, matrix);
      setShowPositionConfirm(true);
    },
    [clickModeEnabled, tilesetRef, cesiumRef, onLocationClick]
  );

  const confirmPosition = useCallback(() => {
    setShowPositionConfirm(false);
    setClickModeEnabled(false);
  }, []);

  const cancelPosition = useCallback(() => {
    setShowPositionConfirm(false);
  }, []);

  const toggleClickMode = useCallback(async () => {
    if (clickModeEnabled) {
      // Cancel click mode - restore previous confirmed transform
      if (
        lastConfirmedTransform &&
        tilesetRef.current &&
        cesiumRef.current &&
        viewerRef.current
      ) {
        const Cesium = cesiumRef.current;
        restoreTransform(
          tilesetRef.current,
          Cesium,
          lastConfirmedTransform,
          viewerRef.current
        );

        // Extract location from transform for callback
        const translation = new Cesium.Cartesian3(
          lastConfirmedTransform[12],
          lastConfirmedTransform[13],
          lastConfirmedTransform[14]
        );
        const cartographic = Cesium.Cartographic.fromCartesian(translation);
        const location: Location = {
          longitude: Cesium.Math.toDegrees(cartographic.longitude),
          latitude: Cesium.Math.toDegrees(cartographic.latitude),
          height: cartographic.height,
        };

        onTransformRestored(lastConfirmedTransform, location);
      }

      setClickModeEnabled(false);
      setShowPositionConfirm(false);
    } else {
      // Enable click-to-position mode
      setClickModeEnabled(true);
    }
  }, [
    clickModeEnabled,
    lastConfirmedTransform,
    tilesetRef,
    cesiumRef,
    viewerRef,
    onTransformRestored,
  ]);

  return {
    clickModeEnabled,
    showPositionConfirm,
    handleLocationClick,
    confirmPosition,
    cancelPosition,
    toggleClickMode,
  };
}

