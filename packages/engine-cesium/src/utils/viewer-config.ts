/**
 * Cesium Viewer configuration utilities
 */

/**
 * Creates viewer configuration options
 */
export function createViewerOptions() {
  // Detect mobile devices for optimization
  const isMobile = typeof window !== "undefined" && (
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
    (window.innerWidth <= 768 && window.matchMedia("(max-width: 768px)").matches)
  );

  return {
    // Disable all UI widgets and controls for better performance
    animation: false,
    baseLayerPicker: false,
    geocoder: false,
    homeButton: false,
    infoBox: false,
    sceneModePicker: false,
    selectionIndicator: false,
    timeline: false,
    navigationHelpButton: false,
    fullscreenButton: false,
    scene3DOnly: true,
    // Performance optimizations
    requestRenderMode: true,
    maximumRenderTimeChange: Infinity,
    // Lower target frame rate on mobile to reduce memory pressure
    targetFrameRate: isMobile ? 30 : 60,
    // IMPORTANT for mobile stability
    contextOptions: {
      webgl: {
        alpha: false,
        antialias: false, // avoid MSAA on mobile
        powerPreference: "high-performance" as WebGLPowerPreference,
        failIfMajorPerformanceCaveat: false,
        preserveDrawingBuffer: false,
        depth: true,
        stencil: false,
      },
    },
    // Imagery provider is configured after viewer creation
    // Remove credits and attribution
    creditContainer: undefined,
    creditViewport: undefined,
  };
}

/**
 * Configures scene defaults for mobile GPUs and calmer earth presentation
 */
export function configureSceneDefaults(scene: any, Cesium: any): void {
  scene.highDynamicRange = false;
  scene.logarithmicDepthBuffer = false; // avoid precision issues with custom materials

  if (scene?.globe) {
    const globe = scene.globe;
    globe.baseColor = Cesium.Color.fromCssColorString("#1a1a1c");
    globe.dynamicAtmosphereLighting = true;
  }

  if (scene?.skyAtmosphere) {
    const atmosphere = scene.skyAtmosphere;
    atmosphere.hueShift = -0.08;
    atmosphere.saturationShift = -0.22;
    atmosphere.brightnessShift = -0.18;
  }
}

/**
 * Configures skybox based on skyboxType
 */
export function configureSkybox(
  viewer: any,
  skyboxType: "default" | "none"
): void {
  if (skyboxType === "default") {
    // Show both skybox (with stars) and atmosphere
    if (viewer.scene.skyBox) {
      viewer.scene.skyBox.show = true;
    }
    if (viewer.scene.skyAtmosphere) {
      viewer.scene.skyAtmosphere.show = true;
    }
  } else if (skyboxType === "none") {
    // Hide both skybox and atmosphere
    if (viewer.scene.skyBox) {
      viewer.scene.skyBox.show = false;
    }
    if (viewer.scene.skyAtmosphere) {
      viewer.scene.skyAtmosphere.show = false;
    }
  }
}

/**
 * Configures lighting settings
 */
export function configureLighting(
  viewer: any,
  cesiumLightingEnabled: boolean
): void {
  if (cesiumLightingEnabled && viewer.scene) {
    viewer.scene.sun.show = true;
    viewer.scene.globe.enableLighting = true;
    if (viewer.scene.skyAtmosphere) {
      viewer.scene.skyAtmosphere.show = true;
    }
  } else {
    viewer.scene.globe.enableLighting = false;
  }
}

/**
 * Configures shadow settings
 */
export function configureShadows(
  viewer: any,
  cesiumShadowsEnabled: boolean
): void {
  if (cesiumShadowsEnabled) {
    viewer.shadows = true;
    if (viewer.shadowMap) {
      viewer.shadowMap.enabled = true;
      viewer.shadowMap.size = 2048;
    }
  }
}

/**
 * Sets the current time on the viewer clock
 */
export function setViewerTime(viewer: any, Cesium: any, time: string): void {
  if (time && viewer.clock) {
    try {
      const jsDate = new Date(time);
      const julianDate = Cesium.JulianDate.fromDate(jsDate);
      viewer.clock.currentTime = julianDate;
    } catch (error) {
      // Ignore time parsing errors
    }
  }
}

/**
 * Sets viewer resolution scale based on device pixel ratio
 * Mobile devices get lower resolution to prevent memory issues
 */
export function setViewerResolutionScale(viewer: any): void {
  // Detect mobile devices
  const isMobile = typeof window !== "undefined" && (
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
    (window.innerWidth <= 768 && window.matchMedia("(max-width: 768px)").matches)
  );

  if (isMobile) {
    // On mobile, use lower resolution to prevent memory crashes
    viewer.resolutionScale = Math.min(window.devicePixelRatio || 1, 1.0);
  } else {
    viewer.resolutionScale = Math.min(window.devicePixelRatio || 1, 1.25);
  }
}

