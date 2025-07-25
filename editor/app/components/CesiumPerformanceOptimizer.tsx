"use client";

import { useEffect, useRef } from "react";

interface CesiumPerformanceOptimizerProps {
  viewer: any;
}

/**
 * Performance optimization component for Cesium
 * Based on successful Next.js 14 + Cesium implementations
 */
export default function CesiumPerformanceOptimizer({
  viewer,
}: CesiumPerformanceOptimizerProps) {
  const optimizationRef = useRef<{
    frameRateMonitor: any;
    memoryMonitor: any;
  }>({ frameRateMonitor: null, memoryMonitor: null });

  useEffect(() => {
    if (!viewer) return;

    const scene = viewer.scene;
    const globe = scene.globe;

    // Performance optimizations
    const applyOptimizations = () => {
      // Disable lighting for better performance
      globe.enableLighting = false;

      // Optimize terrain settings
      globe.maximumScreenSpaceError = 2.0; // Lower = higher quality but slower
      globe.tileCacheSize = 1000; // Increase cache size

      // Optimize scene settings
      scene.fog.enabled = false;
      scene.skyAtmosphere.show = false;
      scene.sun.show = false;
      scene.moon.show = false;

      // Optimize rendering
      scene.debugShowFramesPerSecond = false;
      scene.debugShowGlobeDepth = false;

      // Optimize camera settings
      scene.camera.minimumZoomDistance = 1.0;
      scene.camera.maximumZoomDistance = 20000000.0;

      // Optimize post-processing
      scene.postProcessStages.fxaa.enabled = false;

      // Optimize picking
      scene.pickTranslucentDepth = false;

      // Optimize memory usage
      scene.globe.tileLoadProgressEvent.removeAllListeners();

      console.log(
        "[CesiumPerformanceOptimizer] Applied performance optimizations"
      );
    };

    // Memory monitoring
    const setupMemoryMonitoring = () => {
      const checkMemoryUsage = () => {
        if (performance.memory) {
          const used = performance.memory.usedJSHeapSize / 1024 / 1024;
          const total = performance.memory.totalJSHeapSize / 1024 / 1024;

          if (used > total * 0.8) {
            console.warn(
              "[CesiumPerformanceOptimizer] High memory usage detected:",
              {
                used: `${used.toFixed(2)} MB`,
                total: `${total.toFixed(2)} MB`,
              }
            );

            // Force garbage collection if available
            if (window.gc) {
              window.gc();
            }
          }
        }
      };

      optimizationRef.current.memoryMonitor = setInterval(
        checkMemoryUsage,
        10000
      );
    };

    // Frame rate monitoring
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
            console.warn(
              "[CesiumPerformanceOptimizer] Low frame rate detected:",
              fps
            );

            // Apply additional optimizations for low frame rate
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

    // Apply optimizations after a short delay to ensure viewer is fully initialized
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
  }, [viewer]);

  return null; // This component doesn't render anything
}
