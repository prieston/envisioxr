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
      console.warn("🔥 [CLEANUP] Running sensor cleanup", {
        hasSensor: !!sensorRef.current,
        hasComposite: !!sensorCompositeRef.current,
        hasViewshed: !!viewshedRef.current,
      });
      
      // Clean up composite sensor
      if (sensorCompositeRef.current?.parts) {
        console.warn(`🔥 [CLEANUP] Removing ${sensorCompositeRef.current.parts.length} composite parts`);
        sensorCompositeRef.current.parts.forEach((p: any) => {
          safeRemovePrimitive(cesiumViewer, p);
        });
        sensorCompositeRef.current.parts.length = 0;
      }
      sensorCompositeRef.current = null;

      // Clean up single sensor
      if (sensorRef.current) {
        console.warn("🔥 [CLEANUP] Removing single sensor");
        safeRemovePrimitive(cesiumViewer, sensorRef.current);
      }
      sensorRef.current = null;

      // Clean up viewshed
      if (viewshedRef.current) {
        console.warn("🔥 [CLEANUP] Removing viewshed");
        cesiumViewer?.entities?.remove(viewshedRef.current);
      }
      viewshedRef.current = null;

      lastShapeSigRef.current = "";
      console.warn("🔥 [CLEANUP] Cleanup complete");
    };
    // Include refs in dependencies so cleanup is recreated when refs change
  }, [refs, cesiumViewer, lastShapeSigRef]);
}
