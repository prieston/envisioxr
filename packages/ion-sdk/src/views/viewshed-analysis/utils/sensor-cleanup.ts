export function safeRemovePrimitive(primitive: any, viewer: any): void {
  try {
    if (
      primitive &&
      typeof primitive.isDestroyed === "function" &&
      !primitive.isDestroyed()
    ) {
      viewer?.scene?.primitives?.remove(primitive);
    }
  } catch (err) {
    console.warn("Failed to remove primitive:", err);
  }
}

export function removeSensor(sensor: any, viewer: any): void {
  if (!sensor) return;

  try {
    if (sensor instanceof (window as any).Cesium.Entity) {
      viewer?.entities?.remove(sensor);
    } else {
      viewer?.scene?.primitives?.remove(sensor);
    }
  } catch (err) {
    console.warn("Failed to remove sensor:", err);
  }
}

export function removeComposite(composite: any, viewer: any): void {
  if (!composite?.parts) return;

  try {
    composite.parts.forEach((part: any) => {
      viewer?.scene?.primitives?.remove(part);
    });
  } catch (err) {
    console.warn("Failed to remove composite sensor parts:", err);
  }
}
