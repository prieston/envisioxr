import { useEffect } from "react";
import type { SensorRefs } from "../types";
import { safeRemovePrimitive } from "../utils";

export function useSensorCleanup(
  refs: SensorRefs,
  cesiumViewer: any,
  lastShapeSigRef: React.MutableRefObject<string>
) {
  useEffect(() => {
    return () => {
      // Clean up composite sensor
      if (refs.sensorCompositeRef.current?.parts) {
        refs.sensorCompositeRef.current.parts.forEach((p: any) => {
          safeRemovePrimitive(cesiumViewer, p);
        });
        refs.sensorCompositeRef.current.parts.length = 0;
      }
      refs.sensorCompositeRef.current = null;

      // Clean up single sensor
      if (refs.sensorRef.current) {
        safeRemovePrimitive(cesiumViewer, refs.sensorRef.current);
      }
      refs.sensorRef.current = null;

      // Clean up viewshed
      if (refs.viewshedRef.current) {
        cesiumViewer?.entities?.remove(refs.viewshedRef.current);
      }
      refs.viewshedRef.current = null;

      lastShapeSigRef.current = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run cleanup on unmount
}
