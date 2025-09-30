import * as Cesium from "cesium";

export type ScreenClick = { x: number; y: number };

export function setupCesiumClickSelector(
  viewer: { canvas: HTMLCanvasElement },
  onClick: (pos: ScreenClick) => void
): () => void {
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
  handler.setInputAction((movement: any) => {
    const pos = movement?.position as ScreenClick | undefined;
    if (pos) onClick(pos);
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  const prev = viewer.canvas.style.cursor;
  viewer.canvas.style.cursor = "crosshair";

  return () => {
    try {
      handler.destroy();
    } catch {}
    viewer.canvas.style.cursor = prev || "auto";
  };
}
