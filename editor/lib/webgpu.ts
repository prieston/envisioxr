export async function isWebGPUAvailable(): Promise<boolean> {
  if (typeof window === "undefined" || !navigator.gpu) {
    return false;
  }

  try {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      return false;
    }
    const device = await adapter.requestDevice();
    return !!device;
  } catch (e) {
    return false;
  }
}

export function createWebGPUContext() {
  return {
    alpha: true,
    antialias: true,
    powerPreference: "high-performance" as const,
    failIfMajorPerformanceCaveat: true,
  };
}
