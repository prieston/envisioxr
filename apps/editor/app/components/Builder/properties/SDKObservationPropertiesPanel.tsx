"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Box } from "@mui/material";
import { useSceneStore } from "@klorad/core";
import { ModelObject } from "./types";
import { useRafSchedule } from "./sdk-observation/useRafSchedule";
import { SectionHeader } from "./sdk-observation/SectionHeader";
import { SensorTypeSelector } from "./sdk-observation/SensorTypeSelector";
import { FOVSlider } from "./sdk-observation/FOVSlider";
import { VisibilityRadiusSlider } from "./sdk-observation/VisibilityRadiusSlider";
import { VisualizationSwitch } from "./sdk-observation/VisualizationSwitch";
import { TransparencySlider } from "./sdk-observation/TransparencySlider";

interface SDKObservationPropertiesPanelProps {
  selectedObject: ModelObject | null;
  onPropertyChange: (property: string, value: unknown) => void;
  onCalculateViewshed?: () => void;
  isCalculating?: boolean;
}

const defaultObservationProps = {
  sensorType: "cone" as "cone" | "rectangle",
  fov: 60,
  fovH: 60,
  fovV: 36,
  visibilityRadius: 500,
  showSensorGeometry: true,
  showViewshed: false,
  analysisQuality: "medium" as "low" | "medium" | "high",
  // Use theme success color (softer green) instead of pure green
  sensorColor: "#22c55e",
  viewshedColor: "#0080ff",
  viewshedOpacity: 0.35, // Default opacity for viewshed colors (0-1)
  clearance: 2.0,
  raysElevation: 8,
  stepCount: 64,
};

const SDKObservationPropertiesPanel: React.FC<
  SDKObservationPropertiesPanelProps
> = ({
  selectedObject,
  onPropertyChange,
  onCalculateViewshed: _onCalculateViewshed,
  isCalculating: _isCalculating,
}) => {
  const observationProps = useSceneStore((state) => {
    const obj = state.objects.find((o) => o.id === selectedObject?.id);
    return obj?.observationProperties;
  }, Object.is);

  const obs = observationProps ?? defaultObservationProps;
  const isDragging = useRef(false);

  const [local, setLocal] = useState({
    sensorType: obs.sensorType,
    fov: obs.fov,
    fovH: obs.fovH ?? obs.fov,
    fovV: obs.fovV ?? Math.round(obs.fov * 0.6),
    visibilityRadius: obs.visibilityRadius,
    showSensorGeometry: obs.showSensorGeometry,
    showViewshed: obs.showViewshed,
    viewshedOpacity: obs.viewshedOpacity ?? 0.35,
    clearance: obs.clearance ?? 2.0,
    raysElevation: obs.raysElevation ?? 8,
    stepCount: obs.stepCount ?? 64,
    analysisQuality: obs.analysisQuality ?? "medium",
  });

  useEffect(() => {
    if (isDragging.current) return;
    setLocal({
      sensorType: obs.sensorType,
      fov: obs.fov,
      fovH: obs.fovH ?? obs.fov,
      fovV: obs.fovV ?? Math.round(obs.fov * 0.6),
      visibilityRadius: obs.visibilityRadius,
      showSensorGeometry: obs.showSensorGeometry,
      showViewshed: obs.showViewshed,
      viewshedOpacity: obs.viewshedOpacity ?? 0.35,
      clearance: obs.clearance ?? 2.0,
      raysElevation: obs.raysElevation ?? 8,
      stepCount: obs.stepCount ?? 64,
      analysisQuality: obs.analysisQuality ?? "medium",
    });
  }, [
    selectedObject?.id,
    obs.sensorType,
    obs.fov,
    obs.fovH,
    obs.fovV,
    obs.visibilityRadius,
    obs.showSensorGeometry,
    obs.showViewshed,
    obs.viewshedOpacity,
    obs.clearance,
    obs.raysElevation,
    obs.stepCount,
    obs.analysisQuality,
  ]);

  const startDrag = useCallback(() => {
    isDragging.current = true;
  }, []);

  const endDrag = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handlePropertyChange = useCallback(
    (property: string, value: unknown) => {
      onPropertyChange(`observationProperties.${property}`, value);
    },
    [onPropertyChange]
  );

  const schedulePreview = useRafSchedule(
    useCallback(
      (patch: Partial<typeof obs>) => {
        if (!selectedObject?.id) return;

        const viewer = useSceneStore.getState().cesiumViewer;
        if (!viewer) return;

        const event = new CustomEvent("cesium-observation-preview", {
          detail: {
            objectId: selectedObject.id,
            patch,
            tick: Date.now(),
          },
        });
        window.dispatchEvent(event);
        viewer.scene?.requestRender?.();
      },
      [selectedObject?.id]
    )
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Sensor Configuration */}
      <Box>
        <SectionHeader
          title="Sensor Configuration"
          description="Configure field of view and visibility range"
        />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <SensorTypeSelector
            value={local.sensorType}
            onChange={(sensorType) => {
              setLocal((s) => ({
                ...s,
                sensorType,
                fovH: s.fovH ?? s.fov,
                fovV: s.fovV ?? Math.round(s.fov * 0.6),
              }));
              handlePropertyChange("sensorType", sensorType);
            }}
          />

          {local.sensorType === "cone" && (
            <FOVSlider
              label="Field of View"
              value={local.fov}
              min={10}
              max={180}
              onDragStart={startDrag}
              onDragEnd={endDrag}
              onChange={(next) => {
                setLocal((s) => ({ ...s, fov: next }));
                schedulePreview({ fov: next });
              }}
              onCommit={(next) => {
                handlePropertyChange("fov", next);
              }}
            />
          )}

          {local.sensorType === "rectangle" && (
            <>
              <FOVSlider
                label="Horizontal FOV"
                value={local.fovH}
                min={10}
                max={360}
                onDragStart={startDrag}
                onDragEnd={endDrag}
                onChange={(next) => {
                  setLocal((s) => ({ ...s, fovH: next }));
                  schedulePreview({ fovH: next });
                }}
                onCommit={(next) => {
                  handlePropertyChange("fovH", next);
                }}
              />
              <FOVSlider
                label="Vertical FOV"
                value={local.fovV}
                min={10}
                max={180}
                onDragStart={startDrag}
                onDragEnd={endDrag}
                onChange={(next) => {
                  setLocal((s) => ({ ...s, fovV: next }));
                  schedulePreview({ fovV: next });
                }}
                onCommit={(next) => {
                  handlePropertyChange("fovV", next);
                }}
              />
            </>
          )}

          <VisibilityRadiusSlider
            value={local.visibilityRadius}
            onDragStart={startDrag}
            onDragEnd={endDrag}
            onChange={(next) => {
              setLocal((s) => ({ ...s, visibilityRadius: next }));
              schedulePreview({ visibilityRadius: next });
            }}
            onCommit={(next) => {
              handlePropertyChange("visibilityRadius", next);
            }}
          />
        </Box>
      </Box>

      {/* Visualization Settings */}
      <Box>
        <SectionHeader
          title="Visualization"
          description="Control visibility of sensor geometry and viewshed"
        />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <VisualizationSwitch
            id={`observation-show-sensor-geometry-${selectedObject?.id}`}
            label="Show Sensor Geometry"
            checked={local.showSensorGeometry}
            onChange={(checked) => {
              setLocal((s) => ({ ...s, showSensorGeometry: checked }));
              schedulePreview({ showSensorGeometry: checked });
              handlePropertyChange("showSensorGeometry", checked);
            }}
          />

          <VisualizationSwitch
            id={`observation-show-viewshed-${selectedObject?.id}`}
            label="Show Viewshed"
            checked={local.showViewshed}
            onChange={(checked) => {
              setLocal((s) => ({ ...s, showViewshed: checked }));
              schedulePreview({ showViewshed: checked });
              handlePropertyChange("showViewshed", checked);
            }}
          />

          {local.showViewshed && (
            <TransparencySlider
              value={local.viewshedOpacity}
              onDragStart={startDrag}
              onDragEnd={endDrag}
              onChange={(next) => {
                setLocal((s) => ({ ...s, viewshedOpacity: next }));
                schedulePreview({ viewshedOpacity: next });
              }}
              onCommit={(next) => {
                handlePropertyChange("viewshedOpacity", next);
              }}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default SDKObservationPropertiesPanel;
