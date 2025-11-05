/**
 * Content component that renders all child components for Cesium viewer
 */

import { useMemo } from "react";
import { useSceneStore } from "@envisio/core";
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

export function CesiumViewerContent({ viewer }: CesiumViewerContentProps) {
  const cesiumViewer = useSceneStore((s) => s.cesiumViewer);
  const objects = useSceneStore((s) => s.objects);

  // Memoize the filtered list of observation objects to prevent re-renders
  const observationObjects = useMemo(
    () =>
      objects.filter(
        (obj) => obj.isObservationModel && obj.observationProperties
      ),
    [objects]
  );


  return (
    <>
      <CesiumPerformanceOptimizer viewer={viewer} />
      <CesiumIonAssetsRenderer />
      <CesiumCameraCaptureHandler />
      <CesiumObservationPointHandler />
      <CesiumCameraSpringController />
      <CesiumPreviewModeController />
      {/* Render professional Ion SDK viewshed analysis for observation models */}
      {observationObjects.map((obj) => {
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
          showViewshed: obj.observationProperties?.showViewshed ?? false,
          sensorColor: obj.observationProperties?.sensorColor || "#00ff00",
          viewshedColor:
            obj.observationProperties?.viewshedColor || "#0080ff",
          analysisQuality:
            obj.observationProperties?.analysisQuality || "medium",
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
          <WeatherData3DDisplay
            key={`weather-display-${obj.id}`}
            objectId={obj.id}
            position={obj.position as [number, number, number]}
            weatherData={obj.weatherData || null}
            displayFormat={obj.iotProperties?.displayFormat || "compact"}
            showInScene={obj.iotProperties?.showInScene}
          />
        ))}

      {/* Feature selector for 3D Tiles metadata */}
      <CesiumFeatureSelector />
    </>
  );
}

