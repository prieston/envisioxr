import { useEffect } from "react";
import type { SensorRefs, TransformConfig } from "../types";
import { buildModelMatrix } from "../utils";
import { updatePose as updateIonPose } from "../../../utils/sensors";

export function useSensorPoseUpdate(
  isInitialized: boolean,
  refs: SensorRefs,
  config: TransformConfig,
  cesiumViewer: any
) {
  useEffect(() => {
    if (!isInitialized) return;
    if (!refs.sensorRef.current && !refs.sensorCompositeRef.current) return;

    const modelMatrix = buildModelMatrix(
      config.position,
      config.rotation,
      config.sensorForwardAxis,
      config.modelFrontAxis,
      config.tiltDeg
    );

    updateIonPose(
      refs.sensorCompositeRef.current ?? refs.sensorRef.current,
      modelMatrix
    );
    cesiumViewer?.scene?.requestRender();
  }, [
    isInitialized,
    config.position,
    config.rotation,
    config.sensorForwardAxis,
    config.modelFrontAxis,
    config.tiltDeg,
    refs,
    cesiumViewer,
  ]);
}
