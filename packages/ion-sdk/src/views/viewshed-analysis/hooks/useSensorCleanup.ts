import { useEffect } from "react";
import type { SensorRefs } from "../types";
import { safeRemovePrimitive } from "../utils";

export function useSensorCleanup(
  refs: SensorRefs,
  cesiumViewer: any,
  lastShapeSigRef: React.MutableRefObject<string>
) {
  useEffect(() => {
    // Capture current ref values in a way that's NOT stale
    const sensorRef = refs.sensorRef;
    const sensorCompositeRef = refs.sensorCompositeRef;
    const viewshedRef = refs.viewshedRef;

    return () => {
      const beforeCount = cesiumViewer?.scene?.primitives?.length ?? 0;
      let removed = 0;

      // Clean up composite sensor
      if (sensorCompositeRef.current?.parts) {
        sensorCompositeRef.current.parts.forEach((p: any) => {
          safeRemovePrimitive(cesiumViewer, p);
          removed++;
        });
        sensorCompositeRef.current.parts.length = 0;
      }
      sensorCompositeRef.current = null;

      // Clean up single sensor
      if (sensorRef.current) {
        safeRemovePrimitive(cesiumViewer, sensorRef.current);
        removed++;
      }
      sensorRef.current = null;

      // Clean up viewshed
      if (viewshedRef.current) {
        cesiumViewer?.entities?.remove(viewshedRef.current);
      }
      viewshedRef.current = null;

      lastShapeSigRef.current = "";

      const afterCount = cesiumViewer?.scene?.primitives?.length ?? 0;
      if (removed > 0) {
        console.log(`🗑️ [CLEANUP] Removed ${removed} sensor(s), primitives: ${beforeCount} → ${afterCount}`);
      }
    };
    // Include refs in dependencies so cleanup is recreated when refs change
  }, [refs, cesiumViewer, lastShapeSigRef]);
}
