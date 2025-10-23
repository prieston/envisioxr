export function ensureCesiumOnWindow(Cesium: any) {
  if (typeof window !== "undefined") {
    (window as any).Cesium = Cesium;
  }
}
