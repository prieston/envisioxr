"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Slider,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SettingsIcon from "@mui/icons-material/Settings";
import PaletteIcon from "@mui/icons-material/Palette";
import TransformIcon from "@mui/icons-material/Transform";

interface SDKObservationPropertiesPanelProps {
  selectedObject: any;
  onPropertyChange: (property: string, value: any) => void;
  onCalculateViewshed: () => void;
  isCalculating?: boolean;
  analysisResults?: {
    visibleArea: number;
    totalArea: number;
    visibilityPercentage: number;
  } | null;
}

const SDKObservationPropertiesPanel: React.FC<
  SDKObservationPropertiesPanelProps
> = ({
  selectedObject,
  onPropertyChange,
  onCalculateViewshed,
  isCalculating = false,
  analysisResults = null,
}) => {
  const [expandedSections, setExpandedSections] = useState({
    sensor: true,
    visualization: true,
    analysis: false,
    transform: false,
  });

  const observationProps = selectedObject?.observationProperties || {
    sensorType: "cone",
    fov: 60,
    visibilityRadius: 500,
    showSensorGeometry: true,
    showViewshed: false,
    analysisQuality: "medium",
    enableTransformEditor: true,
    gizmoMode: "translate" as const,
    sensorColor: "#00ff00",
    viewshedColor: "#0080ff",
    clearance: 2.0,
    raysAzimuth: 120,
    raysElevation: 8,
    stepCount: 64,
  };

  const handleSectionToggle = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handlePropertyChange = (property: string, value: any) => {
    onPropertyChange(`observationProperties.${property}`, value);
  };

  const getSensorTypeDescription = (type: string) => {
    switch (type) {
      case "cone":
        return "Traditional conical field of view - good for cameras and spotlights";
      case "rectangle":
        return "Rectangular field of view - good for surveillance cameras";
      case "dome":
        return "Hemispherical coverage - good for omnidirectional sensors";
      case "custom":
        return "Custom directional filter - for specialized sensor patterns";
      default:
        return "";
    }
  };

  const getQualityDescription = (quality: string) => {
    switch (quality) {
      case "low":
        return "Fast calculation, 60 rays, 4 elevation slices";
      case "medium":
        return "Balanced performance, 120 rays, 8 elevation slices";
      case "high":
        return "High accuracy, 240 rays, 16 elevation slices";
      default:
        return "";
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ display: "flex", alignItems: "center", gap: 1 }}
      >
        <VisibilityIcon />
        SDK Viewshed Analysis
      </Typography>

      {/* Sensor Configuration */}
      <Accordion
        expanded={expandedSections.sensor}
        onChange={() => handleSectionToggle("sensor")}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography
            variant="subtitle1"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <SettingsIcon />
            Sensor Configuration
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Sensor Type</InputLabel>
                <Select
                  value={observationProps.sensorType}
                  onChange={(e) =>
                    handlePropertyChange("sensorType", e.target.value)
                  }
                  label="Sensor Type"
                >
                  <MenuItem value="cone">Cone</MenuItem>
                  <MenuItem value="rectangle">Rectangle</MenuItem>
                  <MenuItem value="dome">Dome</MenuItem>
                  <MenuItem value="custom">Custom</MenuItem>
                </Select>
              </FormControl>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: "block" }}
              >
                {getSensorTypeDescription(observationProps.sensorType)}
              </Typography>
            </Grid>

            {/* FOV Controls based on sensor type */}
            {observationProps.sensorType === "cone" && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Field of View: {observationProps.fov}°
                </Typography>
                <Slider
                  value={observationProps.fov}
                  min={10}
                  max={360}
                  onChange={(_, value) => handlePropertyChange("fov", value)}
                  valueLabelDisplay="auto"
                />
              </Grid>
            )}

            {observationProps.sensorType === "rectangle" && (
              <>
                <Grid item xs={6}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Horizontal FOV:{" "}
                    {observationProps.fovH || observationProps.fov}°
                  </Typography>
                  <Slider
                    value={observationProps.fovH || observationProps.fov}
                    min={10}
                    max={360}
                    onChange={(_, value) => handlePropertyChange("fovH", value)}
                    valueLabelDisplay="auto"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Vertical FOV:{" "}
                    {observationProps.fovV ||
                      Math.round(observationProps.fov * 0.6)}
                    °
                  </Typography>
                  <Slider
                    value={
                      observationProps.fovV ||
                      Math.round(observationProps.fov * 0.6)
                    }
                    min={10}
                    max={180}
                    onChange={(_, value) => handlePropertyChange("fovV", value)}
                    valueLabelDisplay="auto"
                  />
                </Grid>
              </>
            )}

            {observationProps.sensorType === "dome" && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Max Polar Angle:{" "}
                  {observationProps.maxPolar ||
                    Math.round(observationProps.fov * 0.5)}
                  °
                </Typography>
                <Slider
                  value={
                    observationProps.maxPolar ||
                    Math.round(observationProps.fov * 0.5)
                  }
                  min={10}
                  max={180}
                  onChange={(_, value) =>
                    handlePropertyChange("maxPolar", value)
                  }
                  valueLabelDisplay="auto"
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Visibility Radius: {observationProps.visibilityRadius}m
              </Typography>
              <Slider
                value={observationProps.visibilityRadius}
                min={100}
                max={10000}
                step={100}
                onChange={(_, value) =>
                  handlePropertyChange("visibilityRadius", value)
                }
                valueLabelDisplay="auto"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Visualization Options */}
      <Accordion
        expanded={expandedSections.visualization}
        onChange={() => handleSectionToggle("visualization")}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography
            variant="subtitle1"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <PaletteIcon />
            Visualization
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={observationProps.showSensorGeometry}
                    onChange={(e) =>
                      handlePropertyChange(
                        "showSensorGeometry",
                        e.target.checked
                      )
                    }
                  />
                }
                label="Show Sensor Geometry"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={observationProps.showViewshed}
                    onChange={(e) =>
                      handlePropertyChange("showViewshed", e.target.checked)
                    }
                  />
                }
                label="Show Viewshed Analysis"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Sensor Color"
                type="color"
                value={observationProps.sensorColor || "#00ff00"}
                onChange={(e) =>
                  handlePropertyChange("sensorColor", e.target.value)
                }
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Viewshed Color"
                type="color"
                value={observationProps.viewshedColor || "#0080ff"}
                onChange={(e) =>
                  handlePropertyChange("viewshedColor", e.target.value)
                }
                size="small"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Analysis Options */}
      <Accordion
        expanded={expandedSections.analysis}
        onChange={() => handleSectionToggle("analysis")}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography
            variant="subtitle1"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <SettingsIcon />
            Analysis Options
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Analysis Quality</InputLabel>
                <Select
                  value={observationProps.analysisQuality}
                  onChange={(e) =>
                    handlePropertyChange("analysisQuality", e.target.value)
                  }
                  label="Analysis Quality"
                >
                  <MenuItem value="low">Low (Fast)</MenuItem>
                  <MenuItem value="medium">Medium (Balanced)</MenuItem>
                  <MenuItem value="high">High (Accurate)</MenuItem>
                </Select>
              </FormControl>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: "block" }}
              >
                {getQualityDescription(observationProps.analysisQuality)}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Azimuth Rays"
                type="number"
                value={observationProps.raysAzimuth || ""}
                onChange={(e) =>
                  handlePropertyChange(
                    "raysAzimuth",
                    parseInt(e.target.value) || undefined
                  )
                }
                size="small"
                helperText="Number of horizontal samples"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Elevation Slices"
                type="number"
                value={observationProps.raysElevation || ""}
                onChange={(e) =>
                  handlePropertyChange(
                    "raysElevation",
                    parseInt(e.target.value) || undefined
                  )
                }
                size="small"
                helperText="Number of vertical samples"
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Clearance (m)"
                type="number"
                value={observationProps.clearance || 2.0}
                onChange={(e) =>
                  handlePropertyChange("clearance", parseFloat(e.target.value))
                }
                size="small"
                helperText="Height above terrain"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Step Count"
                type="number"
                value={observationProps.stepCount || ""}
                onChange={(e) =>
                  handlePropertyChange(
                    "stepCount",
                    parseInt(e.target.value) || undefined
                  )
                }
                size="small"
                helperText="Samples per ray"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Transform Editor */}
      <Accordion
        expanded={expandedSections.transform}
        onChange={() => handleSectionToggle("transform")}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography
            variant="subtitle1"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <TransformIcon />
            Transform Editor
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormControlLabel
            control={
              <Switch
                checked={observationProps.enableTransformEditor}
                onChange={(e) =>
                  handlePropertyChange(
                    "enableTransformEditor",
                    e.target.checked
                  )
                }
              />
            }
            label="Enable Transform Gizmo"
          />

          {observationProps.enableTransformEditor && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Gizmo Mode</InputLabel>
                  <Select
                    value={observationProps.gizmoMode || "translate"}
                    onChange={(e) =>
                      handlePropertyChange("gizmoMode", e.target.value)
                    }
                    label="Gizmo Mode"
                  >
                    <MenuItem value="translate">Move (Translate)</MenuItem>
                    <MenuItem value="rotate">Rotate</MenuItem>
                    <MenuItem value="scale">Scale</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: "block" }}
          >
            When enabled, you can use the transform gizmo to move, rotate, and
            scale the sensor
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Divider sx={{ my: 2 }} />

      {/* Analysis Results */}
      {analysisResults && (
        <Paper
          sx={{
            p: 2,
            mb: 2,
            bgcolor: "success.light",
            color: "success.contrastText",
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Analysis Results
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={4}>
              <Typography variant="body2">
                Visible: {(analysisResults.visibleArea / 1000).toFixed(1)}k m²
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2">
                Total: {(analysisResults.totalArea / 1000).toFixed(1)}k m²
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                {analysisResults.visibilityPercentage.toFixed(1)}% visible
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Calculate Button */}
      <Button
        variant="contained"
        fullWidth
        onClick={onCalculateViewshed}
        disabled={isCalculating}
        sx={{ mb: 2 }}
      >
        {isCalculating ? "Calculating..." : "Calculate Viewshed"}
      </Button>

      {/* Status Indicators */}
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        {observationProps.showSensorGeometry && (
          <Chip label="Sensor Visible" color="primary" size="small" />
        )}
        {observationProps.showViewshed && (
          <Chip label="Viewshed Active" color="secondary" size="small" />
        )}
        {observationProps.enableTransformEditor && (
          <Chip label="Transform Enabled" color="default" size="small" />
        )}
      </Box>
    </Box>
  );
};

export default SDKObservationPropertiesPanel;
