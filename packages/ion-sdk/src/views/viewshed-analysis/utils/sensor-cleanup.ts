import { safeRemovePrimitive as ionSafeRemove } from "../../../utils/sensors/helpers";

export function safeRemovePrimitive(viewer: any, primitive: any): void {
  ionSafeRemove(viewer, primitive, true);
}

export function removeSensor(sensor: any, viewer: any): void {
  safeRemovePrimitive(viewer, sensor);
}

export function removeComposite(composite: any, viewer: any): void {
  if (!composite?.parts) return;

  composite.parts.forEach((part: any) => {
    safeRemovePrimitive(viewer, part);
  });
  composite.parts.length = 0;
}
