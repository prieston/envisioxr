"use client";

import React, { useState } from "react";
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
    enableTransformEditor: true, // Always enabled
    gizmoMode: "translate" as const,
    sensorColor: "#00ff00",
    viewshedColor: "#0080ff",
    include3DModels: true, // Include 3D models in viewshed analysis
    alignWithModelFront: false, // Align sensor with model's natural front direction
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

      {/* Ion SDK Status */}
      <Paper
        sx={{
          p: 2,
          mb: 2,
          bgcolor: "success.light",
          color: "success.contrastText",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
            🚀 Professional Ion SDK Active
          </Typography>
          <Chip label="Ion SDK" color="primary" size="small" />
        </Box>
        <Typography variant="caption" sx={{ display: "block", mt: 1 }}>
          Enhanced sensors with professional materials, GPU acceleration, and
          advanced features
        </Typography>
      </Paper>

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
            Professional Sensor Configuration
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

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={observationProps.include3DModels || false}
                    onChange={(e) =>
                      handlePropertyChange("include3DModels", e.target.checked)
                    }
                  />
                }
                label="Include 3D Models in Viewshed"
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: "block" }}
              >
                When enabled, 3D models will block visibility and affect the
                viewshed analysis. When disabled, only terrain occlusion is
                considered.
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 2, p: 2, bgcolor: "info.light", borderRadius: 1 }}
              >
                <strong>Ion SDK Viewshed:</strong> The Ion SDK handles viewshed
                analysis automatically with optimized algorithms. No additional
                ray sampling parameters are needed.
              </Typography>
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
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2, p: 2, bgcolor: "info.light", borderRadius: 1 }}
          >
            <strong>Transform Gizmo:</strong> Always enabled for easy sensor
            positioning and rotation. Click the yellow dot on the sensor to
            activate the transform controls.
          </Typography>

          {true && (
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

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={observationProps.alignWithModelFront || false}
                      onChange={(e) =>
                        handlePropertyChange(
                          "alignWithModelFront",
                          e.target.checked
                        )
                      }
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2">
                        Align with Model Front
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Automatically align sensor direction with model's
                        natural front direction
                      </Typography>
                    </Box>
                  }
                />
              </Grid>

              {observationProps.alignWithModelFront && (
                <Grid item xs={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Manual Front Direction</InputLabel>
                    <Select
                      value={observationProps.manualFrontDirection || ""}
                      onChange={(e) =>
                        handlePropertyChange(
                          "manualFrontDirection",
                          e.target.value || undefined
                        )
                      }
                      label="Manual Front Direction"
                    >
                      <MenuItem value="">
                        <em>Auto-detect</em>
                      </MenuItem>
                      <MenuItem value="x">+X (Right)</MenuItem>
                      <MenuItem value="negX">-X (Left)</MenuItem>
                      <MenuItem value="y">+Y (Up)</MenuItem>
                      <MenuItem value="negY">-Y (Down)</MenuItem>
                      <MenuItem value="z">+Z (Forward)</MenuItem>
                      <MenuItem value="negZ">-Z (Backward)</MenuItem>
                    </Select>
                  </FormControl>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5, display: "block" }}
                  >
                    Override automatic detection if the cone points in the wrong
                    direction
                  </Typography>
                </Grid>
              )}
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
        <Chip label="Ion SDK Active" color="primary" size="small" />
        {observationProps.showSensorGeometry && (
          <Chip label="Sensor Visible" color="secondary" size="small" />
        )}
        {observationProps.showViewshed && (
          <Chip label="Viewshed Active" color="success" size="small" />
        )}
        <Chip label="Transform Enabled" color="default" size="small" />
      </Box>
    </Box>
  );
};

export default SDKObservationPropertiesPanel;
