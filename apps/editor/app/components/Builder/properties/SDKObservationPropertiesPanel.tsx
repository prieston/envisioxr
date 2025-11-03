"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  Slider,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { selectStyles, menuItemStyles } from "@envisio/ui";
import { useSceneStore } from "@envisio/core";

/**
 * Batches updates to once per animation frame
 */
function useRafSchedule<T>(fn: (arg: T) => void) {
  const pending = useRef(false);
  const last = useRef<T | null>(null);

  return useCallback(
    (arg: T) => {
      last.current = arg;
      if (pending.current) return;
      pending.current = true;
      requestAnimationFrame(() => {
        pending.current = false;
        if (last.current != null) fn(last.current);
      });
    },
    [fn]
  );
}

interface SDKObservationPropertiesPanelProps {
  selectedObject: any;
  onPropertyChange: (property: string, value: any) => void;
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
  sensorColor: "#00ff00",
  viewshedColor: "#0080ff",
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
  // Note: Zustand deprecation warning can be fixed by updating @envisio/core store definition
  const observationProps = useSceneStore((state) => {
    const obj = state.objects.find((o) => o.id === selectedObject?.id);
    return obj?.observationProperties;
  }, Object.is);

  const obs = observationProps ?? defaultObservationProps;
  const isDragging = useRef(false);

  // Local state for smooth dragging
  const [local, setLocal] = useState({
    sensorType: obs.sensorType,
    fov: obs.fov,
    fovH: obs.fovH ?? obs.fov,
    fovV: obs.fovV ?? Math.round(obs.fov * 0.6),
    visibilityRadius: obs.visibilityRadius,
    showSensorGeometry: obs.showSensorGeometry,
    showViewshed: obs.showViewshed,
    clearance: obs.clearance ?? 2.0,
    raysElevation: obs.raysElevation ?? 8,
    stepCount: obs.stepCount ?? 64,
    analysisQuality: obs.analysisQuality ?? "medium",
  });

  // Sync local state when store changes
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
    obs.clearance,
    obs.raysElevation,
    obs.stepCount,
    obs.analysisQuality,
  ]);

  // Drag helpers
  const startDrag = useCallback(() => {
    isDragging.current = true;
  }, []);

  const endDrag = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handlePropertyChange = useCallback(
    (property: string, value: any) => {
      onPropertyChange(`observationProperties.${property}`, value);
    },
    [onPropertyChange]
  );

  // RAF-batched preview for live updates
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
        <Typography
          sx={(theme) => ({
            fontSize: "0.688rem",
            fontWeight: 600,
            color:
              theme.palette.mode === "dark"
                ? alpha(theme.palette.text.secondary, 0.9)
                : "rgba(51, 65, 85, 0.85)",
            mb: 0.5,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          })}
        >
          Sensor Configuration
        </Typography>
        <Typography
          sx={(theme) => ({
            fontSize: "0.75rem",
            color:
              theme.palette.mode === "dark"
                ? alpha(theme.palette.text.secondary, 0.9)
                : "rgba(100, 116, 139, 0.7)",
            mb: 1.5,
          })}
        >
          Configure field of view and visibility range
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Sensor Type */}
          <Box>
            <Typography
              sx={(theme) => ({
                fontSize: "0.75rem",
                fontWeight: 500,
                color:
                  theme.palette.mode === "dark"
                    ? alpha(theme.palette.text.secondary, 0.9)
                    : "rgba(100, 116, 139, 0.8)",
                mb: 0.75,
              })}
            >
              Sensor Type
            </Typography>
            <Select
              value={local.sensorType}
              onChange={(e) => {
                const sensorType = e.target.value as "cone" | "rectangle";
                setLocal((s) => ({
                  ...s,
                  sensorType,
                  // Initialize defaults for the new mode
                  fovH: s.fovH ?? s.fov,
                  fovV: s.fovV ?? Math.round(s.fov * 0.6),
                }));
                handlePropertyChange("sensorType", sensorType);
              }}
              fullWidth
              size="small"
              sx={selectStyles}
            >
              <MenuItem value="cone" sx={menuItemStyles}>
                Cone
              </MenuItem>
              <MenuItem value="rectangle" sx={menuItemStyles}>
                Rectangle
              </MenuItem>
            </Select>
          </Box>

          {/* Field of View (Cone) */}
          {local.sensorType === "cone" && (
            <Box>
              <Typography
                sx={(theme) => ({
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  color:
                    theme.palette.mode === "dark"
                      ? alpha(theme.palette.text.secondary, 0.9)
                      : "rgba(100, 116, 139, 0.8)",
                  mb: 0.5,
                })}
              >
                Field of View: {local.fov}°
              </Typography>
              <Slider
                value={Math.min(180, local.fov)}
                min={10}
                max={180}
                onPointerDown={startDrag}
                onChange={(_, value) => {
                  const next = Math.min(180, Number(value));
                  setLocal((s) => ({ ...s, fov: next }));
                  schedulePreview({ fov: next });
                }}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onChangeCommitted={(_, value) => {
                  endDrag();
                  const next = Math.min(180, Number(value));
                  handlePropertyChange("fov", next);
                }}
                valueLabelDisplay="auto"
                sx={(theme) => ({
                  color: theme.palette.primary.main,
                  height: 4,
                  "& .MuiSlider-thumb": {
                    width: 16,
                    height: 16,
                    "&:hover, &.Mui-focusVisible": {
                      boxShadow: `0 0 0 8px ${alpha(theme.palette.primary.main, 0.16)}`,
                    },
                  },
                  "& .MuiSlider-track": {
                    border: "none",
                  },
                  "& .MuiSlider-rail": {
                    opacity: theme.palette.mode === "dark" ? 0.4 : 0.3,
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? alpha(theme.palette.common.white, 0.25)
                        : "rgba(100, 116, 139, 0.3)",
                  },
                })}
              />
            </Box>
          )}

          {/* Horizontal/Vertical FOV (Rectangle) */}
          {local.sensorType === "rectangle" && (
            <>
              <Box>
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    color: "rgba(100, 116, 139, 0.8)",
                    mb: 0.5,
                  }}
                >
                  Horizontal FOV: {local.fovH}°
                </Typography>
                <Slider
                  value={Math.min(360, local.fovH)}
                  min={10}
                  max={360}
                  onPointerDown={startDrag}
                  onChange={(_, value) => {
                    const next = Math.min(360, Number(value));
                    setLocal((s) => ({ ...s, fovH: next }));
                    schedulePreview({ fovH: next });
                  }}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                  onChangeCommitted={(_, value) => {
                    endDrag();
                    const next = Math.min(360, Number(value));
                    handlePropertyChange("fovH", next);
                  }}
                  valueLabelDisplay="auto"
                  sx={(theme) => ({
                    color: theme.palette.primary.main,
                    height: 4,
                    "& .MuiSlider-thumb": {
                      width: 16,
                      height: 16,
                      "&:hover, &.Mui-focusVisible": {
                        boxShadow: `0 0 0 8px ${alpha(theme.palette.primary.main, 0.16)}`,
                      },
                    },
                    "& .MuiSlider-track": {
                      border: "none",
                    },
                    "& .MuiSlider-rail": {
                      opacity: theme.palette.mode === "dark" ? 0.4 : 0.3,
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? alpha(theme.palette.common.white, 0.25)
                          : "rgba(100, 116, 139, 0.3)",
                    },
                  })}
                />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    color: "rgba(100, 116, 139, 0.8)",
                    mb: 0.5,
                  }}
                >
                  Vertical FOV: {local.fovV}°
                </Typography>
                <Slider
                  value={Math.min(180, local.fovV)}
                  min={10}
                  max={180}
                  onPointerDown={startDrag}
                  onChange={(_, value) => {
                    const next = Math.min(180, Number(value));
                    setLocal((s) => ({ ...s, fovV: next }));
                    schedulePreview({ fovV: next });
                  }}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                  onChangeCommitted={(_, value) => {
                    endDrag();
                    const next = Math.min(180, Number(value));
                    handlePropertyChange("fovV", next);
                  }}
                  valueLabelDisplay="auto"
                  sx={(theme) => ({
                    color: theme.palette.primary.main,
                    height: 4,
                    "& .MuiSlider-thumb": {
                      width: 16,
                      height: 16,
                      "&:hover, &.Mui-focusVisible": {
                        boxShadow: `0 0 0 8px ${alpha(theme.palette.primary.main, 0.16)}`,
                      },
                    },
                    "& .MuiSlider-track": {
                      border: "none",
                    },
                    "& .MuiSlider-rail": {
                      opacity: theme.palette.mode === "dark" ? 0.4 : 0.3,
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? alpha(theme.palette.common.white, 0.25)
                          : "rgba(100, 116, 139, 0.3)",
                    },
                  })}
                />
              </Box>
            </>
          )}

          {/* Visibility Radius */}
          <Box>
            <Typography
              sx={{
                fontSize: "0.75rem",
                fontWeight: 500,
                color: "rgba(100, 116, 139, 0.8)",
                mb: 0.5,
              }}
            >
              Visibility Radius: {local.visibilityRadius}m
            </Typography>
            <Slider
              value={local.visibilityRadius}
              min={10}
              max={2500}
              step={10}
              onPointerDown={startDrag}
              onChange={(_, value) => {
                const next = Number(value);
                setLocal((s) => ({ ...s, visibilityRadius: next }));
                schedulePreview({ visibilityRadius: next });
              }}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onChangeCommitted={(_, value) => {
                endDrag();
                const next = Number(value);
                handlePropertyChange("visibilityRadius", next);
              }}
              valueLabelDisplay="auto"
              sx={(theme) => ({
                color: theme.palette.primary.main,
                height: 4,
                "& .MuiSlider-thumb": {
                  width: 16,
                  height: 16,
                  "&:hover, &.Mui-focusVisible": {
                    boxShadow: `0 0 0 8px ${alpha(theme.palette.primary.main, 0.16)}`,
                  },
                },
                "& .MuiSlider-track": {
                  border: "none",
                },
                "& .MuiSlider-rail": {
                  opacity: theme.palette.mode === "dark" ? 0.4 : 0.3,
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? alpha(theme.palette.common.white, 0.25)
                      : "rgba(100, 116, 139, 0.3)",
                },
              })}
            />
          </Box>
        </Box>
      </Box>

      {/* Visualization Settings */}
      <Box>
        <Typography
          sx={(theme) => ({
            fontSize: "0.688rem",
            fontWeight: 600,
            color:
              theme.palette.mode === "dark"
                ? alpha(theme.palette.text.secondary, 0.9)
                : "rgba(51, 65, 85, 0.85)",
            mb: 0.5,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          })}
        >
          Visualization
        </Typography>
        <Typography
          sx={(theme) => ({
            fontSize: "0.75rem",
            color:
              theme.palette.mode === "dark"
                ? alpha(theme.palette.text.secondary, 0.9)
                : "rgba(100, 116, 139, 0.7)",
            mb: 1.5,
          })}
        >
          Control visibility of sensor geometry and viewshed
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Show Sensor Geometry */}
          <Box
            sx={(theme) => ({
              backgroundColor:
                theme.palette.mode === "dark"
                  ? theme.palette.background.paper
                  : theme.palette.common.white,
              borderRadius: "4px",
              border:
                theme.palette.mode === "dark"
                  ? "1px solid rgba(255, 255, 255, 0.08)"
                  : "1px solid rgba(255, 255, 255, 0.08)",
            })}
          >
            <FormControlLabel
              control={
                <Switch
                  id={`observation-show-sensor-geometry-${selectedObject.id}`}
                  name="observation-show-sensor-geometry"
                  checked={local.showSensorGeometry}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setLocal((s) => ({ ...s, showSensorGeometry: checked }));
                    schedulePreview({ showSensorGeometry: checked });
                    handlePropertyChange("showSensorGeometry", checked);
                  }}
                  sx={(theme) => ({
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: theme.palette.primary.main,
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: theme.palette.primary.main,
                    },
                  })}
                />
              }
              label="Show Sensor Geometry"
              sx={(theme) => ({
                margin: 0,
                padding: "8.5px 14px",
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                "& .MuiFormControlLabel-label": {
                  fontSize: "0.75rem",
                  fontWeight: 400,
                  color: theme.palette.text.secondary,
                  flex: 1,
                },
              })}
              labelPlacement="start"
            />
          </Box>

          {/* Show Viewshed */}
          <Box
            sx={(theme) => ({
              backgroundColor:
                theme.palette.mode === "dark"
                  ? theme.palette.background.paper
                  : theme.palette.common.white,
              borderRadius: "4px",
              border:
                theme.palette.mode === "dark"
                  ? "1px solid rgba(255, 255, 255, 0.08)"
                  : "1px solid rgba(255, 255, 255, 0.08)",
            })}
          >
            <FormControlLabel
              control={
                <Switch
                  id={`observation-show-viewshed-${selectedObject.id}`}
                  name="observation-show-viewshed"
                  checked={local.showViewshed}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setLocal((s) => ({ ...s, showViewshed: checked }));
                    schedulePreview({ showViewshed: checked });
                    handlePropertyChange("showViewshed", checked);
                  }}
                  sx={(theme) => ({
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: theme.palette.primary.main,
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: theme.palette.primary.main,
                    },
                  })}
                />
              }
              label="Show Viewshed"
              sx={(theme) => ({
                margin: 0,
                padding: "8.5px 14px",
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                "& .MuiFormControlLabel-label": {
                  fontSize: "0.75rem",
                  fontWeight: 400,
                  color: theme.palette.text.secondary,
                  flex: 1,
                },
              })}
              labelPlacement="start"
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SDKObservationPropertiesPanel;
