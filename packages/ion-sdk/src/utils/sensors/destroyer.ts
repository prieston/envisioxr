/**
 * Functions for destroying sensors and cleaning up resources
 */

import { IonSensor, SensorComposite } from "./types";
import { isDestroyed, requestRender, safeRemovePrimitive } from "./helpers";

/**
 * Destroy a sensor or composite and clean up all resources
 */
export function destroySensor(
  target: IonSensor | SensorComposite,
  viewer?: any
): void {
  if ((target as SensorComposite).parts) {
    const comp = target as SensorComposite;
    if (comp.destroy) {
      comp.destroy();
    } else {
      // Fallback
      comp.parts.forEach((p) => safeRemovePrimitive(viewer, p));
      comp.parts.length = 0;
    }
  } else if (!isDestroyed(target)) {
    safeRemovePrimitive(viewer, target);
  }
  requestRender(viewer);
}
