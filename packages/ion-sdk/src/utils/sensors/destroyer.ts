/**
 * Functions for destroying sensors and cleaning up resources
 */

import { IonSensor } from "./types";
import { isDestroyed, requestRender, safeRemovePrimitive } from "./helpers";

/**
 * Destroy a sensor and clean up all resources
 */
export function destroySensor(target: IonSensor, viewer?: any): void {
  if (!isDestroyed(target)) {
    safeRemovePrimitive(viewer, target);
  }
  requestRender(viewer);
}
