import * as Cesium from "cesium";

export type ScreenClick = { x: number; y: number };

export function setupCesiumClickSelector(
  viewer: any,
  onClick: (pos: ScreenClick) => void
): () => void {
  const canvas: HTMLCanvasElement =
    viewer?.cesiumWidget?.canvas || viewer?.scene?.canvas || viewer?.canvas;
  if (!canvas) {
    console.warn("[CesiumClickSelector] No canvas found on viewer");
    return () => {};
  }

  const handler = new Cesium.ScreenSpaceEventHandler(canvas);
  handler.setInputAction((movement: any) => {
    const pos = movement?.position as ScreenClick | undefined;
    if (pos) {
      onClick(pos);
    } else {
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  const prev = canvas.style.cursor;
  canvas.style.cursor = "crosshair";

  return () => {
    try {
      handler.destroy();
    } catch {}
    canvas.style.cursor = prev || "auto";
  };
}
