/**
 * Content component that renders all child components for Cesium viewer
 */

import { useMemo, useEffect } from "react";
import { useSceneStore, useIoTStore } from "@envisio/core";
import dynamic from "next/dynamic";
import {
  CesiumPerformanceOptimizer,
  CesiumIonAssetsRenderer,
  CesiumCameraCaptureHandler,
  CesiumObservationPointHandler,
  CesiumCameraSpringController,
  CesiumPreviewModeController,
  CesiumFeatureSelector,
} from "../helpers";
import { CesiumWeatherData3DDisplay as WeatherData3DDisplay } from "../helpers";

const ViewshedAnalysis = dynamic<any>(
  () => import("@envisio/ion-sdk").then((m) => m.ViewshedAnalysis as any),
  { ssr: false }
);

interface CesiumViewerContentProps {
  viewer: any;
}

// Performance limit: Too many active viewsheds can cause performance issues
// Cesium Ion SDK sensors are computationally expensive - each one performs
// real-time ray casting against terrain and 3D models
const MAX_RECOMMENDED_VIEWSHEDS = 8;
const WARNING_THRESHOLD_VIEWSHEDS = 10;
// Mobile devices have stricter limits due to memory constraints
const MAX_MOBILE_VIEWSHEDS = 3;

// Detect mobile devices
const isMobileDevice = (): boolean => {
  if (typeof window === "undefined") return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
    (window.innerWidth <= 768 && window.matchMedia("(max-width: 768px)").matches);
};

// Wrapper component that subscribes to IoT store for weather data
function IoTWeatherDisplayWrapper({
  objectId,
  position,
  displayFormat,
  showInScene,
}: {
  objectId: string;
  position: [number, number, number];
  displayFormat: "compact" | "detailed" | "minimal";
  showInScene: boolean;
}) {
  // Subscribe directly to the specific objectId's weatherData
  // Zustand will track changes to the weatherData object and re-render when it changes
  const weatherData = useIoTStore((state) => state.weatherData[objectId]);

  return (
    <WeatherData3DDisplay
      objectId={objectId}
      position={position}
      weatherData={weatherData || null}
      displayFormat={displayFormat}
      showInScene={showInScene}
    />
  );
}

export function CesiumViewerContent({ viewer }: CesiumViewerContentProps) {
  const cesiumViewer = useSceneStore((s) => s.cesiumViewer);
  const objects = useSceneStore((s) => s.objects);
  const isMobile = isMobileDevice();

  // Memoize the filtered list of observation objects to prevent re-renders
  const observationObjects = useMemo(
    () =>
      objects.filter(
        (obj) => obj.isObservationModel && obj.observationProperties
      ),
    [objects]
  );

  // Limit viewsheds on mobile devices to prevent memory issues
  const limitedObservationObjects = useMemo(() => {
    if (!isMobile) return observationObjects;

    // On mobile, only render the first few viewsheds to prevent memory crashes
    const limited = observationObjects.slice(0, MAX_MOBILE_VIEWSHEDS);
    if (limited.length < observationObjects.length) {
      console.warn(
        `[Mobile Optimization] Limiting viewshed rendering to ${MAX_MOBILE_VIEWSHEDS} out of ${observationObjects.length} observation points to prevent memory issues on mobile devices.`
      );
    }
    return limited;
  }, [observationObjects, isMobile]);

  // Performance warning for too many viewsheds
  useEffect(() => {
    const activeViewsheds = observationObjects.filter(
      (obj) => obj.observationProperties?.showViewshed !== false
    ).length;

    const threshold = isMobile ? MAX_MOBILE_VIEWSHEDS : WARNING_THRESHOLD_VIEWSHEDS;

    if (activeViewsheds >= threshold) {
      console.warn(
        `[Performance Warning] ${activeViewsheds} viewshed analyses are active. ` +
        `Cesium Ion SDK sensors are computationally expensive and may cause performance issues. ` +
        `Consider reducing the number of active viewsheds or disabling viewshed rendering (` +
        `showViewshed: false) for some sensors. ` +
        `Recommended maximum: ${isMobile ? MAX_MOBILE_VIEWSHEDS : MAX_RECOMMENDED_VIEWSHEDS} active viewsheds.`
      );
    }
  }, [observationObjects, isMobile]);

  return (
    <>
      <CesiumPerformanceOptimizer viewer={viewer} />
      <CesiumIonAssetsRenderer />
      <CesiumCameraCaptureHandler />
      <CesiumObservationPointHandler />
      <CesiumCameraSpringController />
      <CesiumPreviewModeController />
      {/* Render professional Ion SDK viewshed analysis for observation models */}
      {/* On mobile, limit rendering to prevent memory crashes */}
      {limitedObservationObjects.map((obj) => {
        const position = Array.isArray(obj.position)
          ? obj.position
          : [0, 0, 0];
        const [longitude, latitude, height] = position;
        const rotation = Array.isArray(obj.rotation)
          ? obj.rotation
          : [0, 0, 0];

        const observationProps = {
          sensorType: obj.observationProperties?.sensorType || "cone",
          fov: obj.observationProperties?.fov || 60,
          fovH: obj.observationProperties?.fovH,
          fovV: obj.observationProperties?.fovV,
          visibilityRadius:
            obj.observationProperties?.visibilityRadius || 500,
          showSensorGeometry:
            obj.observationProperties?.showSensorGeometry ?? true,
          // On mobile, disable viewshed by default to reduce memory usage
          showViewshed: isMobile
            ? false
            : (obj.observationProperties?.showViewshed ?? false),
          // Use theme success color (softer green) instead of pure green
          sensorColor: obj.observationProperties?.sensorColor || "#22c55e",
          viewshedColor:
            obj.observationProperties?.viewshedColor || "#0080ff",
          // Use lower quality on mobile to reduce memory usage
          analysisQuality: isMobile
            ? "low"
            : (obj.observationProperties?.analysisQuality || "medium"),
          include3DModels: obj.observationProperties?.include3DModels,
          alignWithModelFront:
            obj.observationProperties?.alignWithModelFront,
          modelFrontAxis: obj.observationProperties?.modelFrontAxis,
          sensorForwardAxis: obj.observationProperties?.sensorForwardAxis,
          tiltDeg: obj.observationProperties?.tiltDeg,
        } as const;

        return (
          <ViewshedAnalysis
            key={`ion-viewshed-${obj.id}`}
            position={[longitude, latitude, height]}
            rotation={rotation}
            observationProperties={observationProps as any}
            objectId={obj.id}
            cesiumViewer={cesiumViewer}
          />
        );
      })}

      {/* IoT Weather Display for objects with IoT properties */}
      {objects
        .filter(
          (obj) =>
            obj.iotProperties?.enabled && obj.iotProperties?.showInScene
        )
        .map((obj) => (
          <IoTWeatherDisplayWrapper
            key={`weather-display-${obj.id}`}
            objectId={obj.id}
            position={obj.position as [number, number, number]}
            displayFormat={obj.iotProperties?.displayFormat || "compact"}
            showInScene={obj.iotProperties?.showInScene ?? true}
          />
        ))}

      {/* Feature selector for 3D Tiles metadata */}
      <CesiumFeatureSelector />
    </>
  );
}
