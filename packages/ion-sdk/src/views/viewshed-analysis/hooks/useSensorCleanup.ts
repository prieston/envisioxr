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
      refs.sensorCompositeRef.current?.parts?.forEach((p: any) => {
        safeRemovePrimitive(p, cesiumViewer);
      });

      if (refs.sensorRef.current) {
        safeRemovePrimitive(refs.sensorRef.current, cesiumViewer);
      }

      if (refs.viewshedRef.current) {
        cesiumViewer?.entities?.remove(refs.viewshedRef.current);
      }

      refs.sensorCompositeRef.current = null;
      refs.sensorRef.current = null;
      lastShapeSigRef.current = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run cleanup on unmount
}
