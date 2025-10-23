"use client";

import React from "react";
import {
  Box,
  Typography,
  Slider,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { selectStyles, menuItemStyles } from "@envisio/ui";

interface SDKObservationPropertiesPanelProps {
  selectedObject: any;
  onPropertyChange: (property: string, value: any) => void;
  onCalculateViewshed?: () => void;
  isCalculating?: boolean;
}

const SDKObservationPropertiesPanel: React.FC<
  SDKObservationPropertiesPanelProps
> = ({
  selectedObject,
  onPropertyChange,
  onCalculateViewshed: _onCalculateViewshed,
  isCalculating: _isCalculating,
}) => {
  const observationProps = selectedObject?.observationProperties || {
    sensorType: "cone",
    fov: 60,
    visibilityRadius: 500,
    showSensorGeometry: true,
    showViewshed: false,
    sensorColor: "#00ff00",
    viewshedColor: "#0080ff",
  };

  const handlePropertyChange = (property: string, value: any) =>
    onPropertyChange(`observationProperties.${property}`, value);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Sensor Configuration */}
      <Box>
        <Typography
          sx={{
            fontSize: "0.688rem",
            fontWeight: 600,
            color: "rgba(51, 65, 85, 0.85)",
            mb: 0.5,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Sensor Configuration
        </Typography>
        <Typography
          sx={{
            fontSize: "0.75rem",
            color: "rgba(100, 116, 139, 0.7)",
            mb: 1.5,
          }}
        >
          Configure field of view and visibility range
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Sensor Type */}
          <Box>
            <Typography
              sx={{
                fontSize: "0.75rem",
                fontWeight: 500,
                color: "rgba(100, 116, 139, 0.8)",
                mb: 0.75,
              }}
            >
              Sensor Type
            </Typography>
            <Select
              value={observationProps.sensorType}
              onChange={(e) =>
                handlePropertyChange("sensorType", e.target.value)
              }
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
          {observationProps.sensorType === "cone" && (
            <Box>
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  color: "rgba(100, 116, 139, 0.8)",
                  mb: 0.5,
                }}
              >
                Field of View: {observationProps.fov}°
              </Typography>
              <Slider
                value={Math.min(180, observationProps.fov)}
                min={10}
                max={180}
                onChange={(_, value) =>
                  handlePropertyChange("fov", Math.min(180, Number(value)))
                }
                valueLabelDisplay="auto"
                sx={{
                  color: "#2563eb",
                  height: 4,
                  "& .MuiSlider-thumb": {
                    width: 16,
                    height: 16,
                    "&:hover, &.Mui-focusVisible": {
                      boxShadow: "0 0 0 8px rgba(37, 99, 235, 0.16)",
                    },
                  },
                  "& .MuiSlider-track": {
                    border: "none",
                  },
                  "& .MuiSlider-rail": {
                    opacity: 0.3,
                    backgroundColor: "rgba(100, 116, 139, 0.3)",
                  },
                }}
              />
            </Box>
          )}

          {/* Horizontal/Vertical FOV (Rectangle) */}
          {observationProps.sensorType === "rectangle" && (
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
                  Horizontal FOV:{" "}
                  {observationProps.fovH || observationProps.fov}°
                </Typography>
                <Slider
                  value={Math.min(
                    180,
                    observationProps.fovH || observationProps.fov
                  )}
                  min={10}
                  max={180}
                  onChange={(_, value) =>
                    handlePropertyChange("fovH", Math.min(180, Number(value)))
                  }
                  valueLabelDisplay="auto"
                  sx={{
                    color: "#2563eb",
                    height: 4,
                    "& .MuiSlider-thumb": {
                      width: 16,
                      height: 16,
                      "&:hover, &.Mui-focusVisible": {
                        boxShadow: "0 0 0 8px rgba(37, 99, 235, 0.16)",
                      },
                    },
                    "& .MuiSlider-track": {
                      border: "none",
                    },
                    "& .MuiSlider-rail": {
                      opacity: 0.3,
                      backgroundColor: "rgba(100, 116, 139, 0.3)",
                    },
                  }}
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
                  Vertical FOV:{" "}
                  {observationProps.fovV ||
                    Math.round(observationProps.fov * 0.6)}
                  °
                </Typography>
                <Slider
                  value={Math.min(
                    180,
                    observationProps.fovV ||
                      Math.round(observationProps.fov * 0.6)
                  )}
                  min={10}
                  max={180}
                  onChange={(_, value) =>
                    handlePropertyChange("fovV", Math.min(180, Number(value)))
                  }
                  valueLabelDisplay="auto"
                  sx={{
                    color: "#2563eb",
                    height: 4,
                    "& .MuiSlider-thumb": {
                      width: 16,
                      height: 16,
                      "&:hover, &.Mui-focusVisible": {
                        boxShadow: "0 0 0 8px rgba(37, 99, 235, 0.16)",
                      },
                    },
                    "& .MuiSlider-track": {
                      border: "none",
                    },
                    "& .MuiSlider-rail": {
                      opacity: 0.3,
                      backgroundColor: "rgba(100, 116, 139, 0.3)",
                    },
                  }}
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
              Visibility Radius: {observationProps.visibilityRadius}m
            </Typography>
            <Slider
              value={observationProps.visibilityRadius}
              min={10}
              max={2500}
              step={10}
              onChange={(_, value) =>
                handlePropertyChange("visibilityRadius", value)
              }
              valueLabelDisplay="auto"
              sx={{
                color: "#2563eb",
                height: 4,
                "& .MuiSlider-thumb": {
                  width: 16,
                  height: 16,
                  "&:hover, &.Mui-focusVisible": {
                    boxShadow: "0 0 0 8px rgba(37, 99, 235, 0.16)",
                  },
                },
                "& .MuiSlider-track": {
                  border: "none",
                },
                "& .MuiSlider-rail": {
                  opacity: 0.3,
                  backgroundColor: "rgba(100, 116, 139, 0.3)",
                },
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Visualization Settings */}
      <Box>
        <Typography
          sx={{
            fontSize: "0.688rem",
            fontWeight: 600,
            color: "rgba(51, 65, 85, 0.85)",
            mb: 0.5,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Visualization
        </Typography>
        <Typography
          sx={{
            fontSize: "0.75rem",
            color: "rgba(100, 116, 139, 0.7)",
            mb: 1.5,
          }}
        >
          Control visibility of sensor geometry and viewshed
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Show Sensor Geometry */}
          <Box
            sx={{
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              border: "1px solid rgba(226, 232, 240, 0.8)",
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={observationProps.showSensorGeometry}
                  onChange={(e) =>
                    handlePropertyChange("showSensorGeometry", e.target.checked)
                  }
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: "#2563eb",
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: "#2563eb",
                    },
                  }}
                />
              }
              label="Show Sensor Geometry"
              sx={{
                margin: 0,
                padding: "8.5px 14px",
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                "& .MuiFormControlLabel-label": {
                  fontSize: "0.75rem",
                  fontWeight: 400,
                  color: "rgba(51, 65, 85, 0.9)",
                  flex: 1,
                },
              }}
              labelPlacement="start"
            />
          </Box>

          {/* Show Viewshed */}
          <Box
            sx={{
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              border: "1px solid rgba(226, 232, 240, 0.8)",
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={observationProps.showViewshed}
                  onChange={(e) =>
                    handlePropertyChange("showViewshed", e.target.checked)
                  }
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: "#2563eb",
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: "#2563eb",
                    },
                  }}
                />
              }
              label="Show Viewshed"
              sx={{
                margin: 0,
                padding: "8.5px 14px",
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                "& .MuiFormControlLabel-label": {
                  fontSize: "0.75rem",
                  fontWeight: 400,
                  color: "rgba(51, 65, 85, 0.9)",
                  flex: 1,
                },
              }}
              labelPlacement="start"
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SDKObservationPropertiesPanel;
