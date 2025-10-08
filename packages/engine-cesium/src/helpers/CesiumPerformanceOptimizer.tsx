"use client";

import { useEffect, useRef } from "react";
import { useSceneStore } from "@envisio/core";

interface CesiumPerformanceOptimizerProps {
  viewer: any;
}

export default function CesiumPerformanceOptimizer({
  viewer,
}: CesiumPerformanceOptimizerProps) {
  const optimizationRef = useRef<{
    frameRateMonitor: any;
    memoryMonitor: any;
  }>({ frameRateMonitor: null, memoryMonitor: null });

  const skyboxType = useSceneStore((state) => state.skyboxType);
  const lightingEnabled = useSceneStore((state) => state.cesiumLightingEnabled);

  useEffect(() => {
    if (!viewer) return;

    const scene = viewer.scene;
    const globe = scene.globe;

    const applyOptimizations = () => {
      // Don't override lighting if it's enabled by user
      if (!lightingEnabled) {
        globe.enableLighting = false;
        scene.sun.show = false;
      }

      globe.maximumScreenSpaceError = 2.0;
      globe.tileCacheSize = 1000;

      scene.fog.enabled = false;

      // Handle skybox and atmosphere based on skyboxType
      if (skyboxType === "default") {
        if (scene.skyBox) scene.skyBox.show = true;
        // Always show atmosphere when skybox is default, regardless of lighting
        if (scene.skyAtmosphere) scene.skyAtmosphere.show = true;
      } else if (skyboxType === "none") {
        if (scene.skyBox) scene.skyBox.show = false;
        if (scene.skyAtmosphere) scene.skyAtmosphere.show = false;
      }

      scene.moon.show = false;

      scene.debugShowFramesPerSecond = false;
      scene.debugShowGlobeDepth = false;

      scene.camera.minimumZoomDistance = 1.0;
      scene.camera.maximumZoomDistance = 20000000.0;

      scene.postProcessStages.fxaa.enabled = false;
      scene.pickTranslucentDepth = false;

      if (
        scene.globe.tileLoadProgressEvent &&
        typeof scene.globe.tileLoadProgressEvent.removeAllListeners ===
          "function"
      ) {
        scene.globe.tileLoadProgressEvent.removeAllListeners();
      }
    };

    const setupMemoryMonitoring = () => {
      const checkMemoryUsage = () => {
        if ("memory" in performance && (performance as any).memory) {
          const used = (performance as any).memory.usedJSHeapSize / 1024 / 1024;
          const total =
            (performance as any).memory.totalJSHeapSize / 1024 / 1024;

          if (used > total * 0.8) {
            if ("gc" in window && (window as any).gc) {
              (window as any).gc();
            }
          }
        }
      };

      optimizationRef.current.memoryMonitor = setInterval(
        checkMemoryUsage,
        10000
      );
    };

    const setupFrameRateMonitoring = () => {
      let frameCount = 0;
      let lastTime = performance.now();

      const countFrames = () => {
        frameCount++;
        const currentTime = performance.now();

        if (currentTime - lastTime >= 1000) {
          const fps = Math.round(
            (frameCount * 1000) / (currentTime - lastTime)
          );

          if (fps < 30) {
            globe.maximumScreenSpaceError = 4.0;
            scene.requestRenderMode = true;
            scene.maximumRenderTimeChange = 1000;
          }

          frameCount = 0;
          lastTime = currentTime;
        }

        requestAnimationFrame(countFrames);
      };

      optimizationRef.current.frameRateMonitor =
        requestAnimationFrame(countFrames);
    };

    const timeoutId = setTimeout(() => {
      applyOptimizations();
      setupMemoryMonitoring();
      setupFrameRateMonitoring();
    }, 1000);

    return () => {
      clearTimeout(timeoutId);

      if (optimizationRef.current.memoryMonitor) {
        clearInterval(optimizationRef.current.memoryMonitor);
      }

      if (optimizationRef.current.frameRateMonitor) {
        cancelAnimationFrame(optimizationRef.current.frameRateMonitor);
      }
    };
  }, [viewer, skyboxType, lightingEnabled]);

  return null;
}
