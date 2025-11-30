import { useState, useCallback } from "react";
import { matrix4ToArray } from "@klorad/engine-cesium";
import type { Location } from "../utils/transform-utils";

interface UseManualInputsOptions {
  tilesetRef: React.MutableRefObject<any>;
  cesiumRef: React.MutableRefObject<any>;
  viewerRef: React.MutableRefObject<any>;
  onTransformApplied: (transform: number[], location: Location) => void;
  onError: (error: string) => void;
}

export function useManualInputs({
  tilesetRef,
  cesiumRef,
  viewerRef,
  onTransformApplied,
  onError,
}: UseManualInputsOptions) {
  const [manualLongitude, setManualLongitude] = useState<string>("");
  const [manualLatitude, setManualLatitude] = useState<string>("");
  const [manualHeight, setManualHeight] = useState<string>("");
  const [manualHeading, setManualHeading] = useState<string>("0");
  const [manualPitch, setManualPitch] = useState<string>("0");
  const [manualRoll, setManualRoll] = useState<string>("0");

  const setValues = useCallback(
    (
      location: Location,
      hpr?: { heading: number; pitch: number; roll: number }
    ) => {
      setManualLongitude(location.longitude.toFixed(6));
      setManualLatitude(location.latitude.toFixed(6));
      setManualHeight(location.height.toFixed(2));
      if (hpr) {
        setManualHeading(hpr.heading.toFixed(2));
        setManualPitch(hpr.pitch.toFixed(2));
        setManualRoll(hpr.roll.toFixed(2));
      } else {
        // Reset rotation to defaults if not provided
        setManualHeading("0");
        setManualPitch("0");
        setManualRoll("0");
      }
    },
    []
  );

  const applyManualChanges = useCallback(async () => {
    if (!cesiumRef.current || !tilesetRef.current || !viewerRef.current) {
      onError("Cesium viewer not ready");
      return;
    }

    try {
      const Cesium = cesiumRef.current;

      const longitude = parseFloat(manualLongitude);
      const latitude = parseFloat(manualLatitude);
      const height = parseFloat(manualHeight);
      const heading = parseFloat(manualHeading);
      const pitch = parseFloat(manualPitch);
      const roll = parseFloat(manualRoll);

      if (isNaN(longitude) || isNaN(latitude) || isNaN(height)) {
        onError("Invalid position values");
        return;
      }

      // Create position
      const position = Cesium.Cartesian3.fromDegrees(
        longitude,
        latitude,
        height
      );

      // Create rotation matrix from HPR
      const headingRadians = Cesium.Math.toRadians(heading);
      const pitchRadians = Cesium.Math.toRadians(pitch);
      const rollRadians = Cesium.Math.toRadians(roll);
      const hpr = new Cesium.HeadingPitchRoll(
        headingRadians,
        pitchRadians,
        rollRadians
      );

      // Create transform matrix with rotation
      const transformMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(
        position,
        hpr,
        Cesium.Ellipsoid.WGS84
      );

      // Apply to tileset
      tilesetRef.current.modelMatrix = transformMatrix;

      // Request renders with safety checks
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.scene.requestRender();
        setTimeout(() => {
          if (viewerRef.current && !viewerRef.current.isDestroyed()) {
            viewerRef.current.scene.requestRender();
          }
        }, 50);
        setTimeout(() => {
          if (viewerRef.current && !viewerRef.current.isDestroyed()) {
            viewerRef.current.scene.requestRender();
          }
        }, 100);
      }

      // Convert matrix to array and notify
      const matrixArray = matrix4ToArray(transformMatrix);
      onTransformApplied(matrixArray, { longitude, latitude, height });
    } catch (err) {
      console.error(
        "[useManualInputs] Failed to apply manual changes:",
        err
      );
      onError(err instanceof Error ? err.message : "Failed to apply changes");
    }
  }, [
    manualLongitude,
    manualLatitude,
    manualHeight,
    manualHeading,
    manualPitch,
    manualRoll,
    tilesetRef,
    cesiumRef,
    viewerRef,
    onTransformApplied,
    onError,
  ]);

  return {
    manualLongitude,
    setManualLongitude,
    manualLatitude,
    setManualLatitude,
    manualHeight,
    setManualHeight,
    manualHeading,
    setManualHeading,
    manualPitch,
    setManualPitch,
    manualRoll,
    setManualRoll,
    setValues,
    applyManualChanges,
  };
}

