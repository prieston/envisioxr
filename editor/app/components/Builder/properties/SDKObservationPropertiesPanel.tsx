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
  InputLabel,
  FormControl,
  Grid,
  TextField,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SettingsIcon from "@mui/icons-material/Settings";
import PaletteIcon from "@mui/icons-material/Palette";

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
  const [expandedSections, setExpandedSections] = useState({
    sensor: true,
    visualization: true,
  });

  const observationProps = selectedObject?.observationProperties || {
    sensorType: "cone",
    fov: 60,
    visibilityRadius: 500,
    showSensorGeometry: true,
    showViewshed: false,
    sensorColor: "#00ff00",
    viewshedColor: "#0080ff",
  };

  const handleSectionToggle = (section: string) =>
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  const handlePropertyChange = (property: string, value: any) =>
    onPropertyChange(`observationProperties.${property}`, value);

  const getSensorTypeDescription = (type: string) => {
    switch (type) {
      case "cone":
        return "Traditional conical field of view - good for cameras and spotlights";
      case "rectangle":
        return "Rectangular field of view - good for surveillance cameras";
      default:
        return "Select a sensor type";
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

            {observationProps.sensorType === "cone" && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
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

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Chip label="Ion SDK Active" color="primary" size="small" />
        {observationProps.showSensorGeometry && (
          <Chip label="Sensor Visible" color="secondary" size="small" />
        )}
        {observationProps.showViewshed && (
          <Chip label="Viewshed Active" color="success" size="small" />
        )}
      </Box>
    </Box>
  );
};

export default SDKObservationPropertiesPanel;
