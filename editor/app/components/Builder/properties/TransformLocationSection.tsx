import React from "react";
import { Box, Typography, TextField, Button } from "@mui/material";
import { LocationOn } from "@mui/icons-material";
import { SettingContainer, SettingLabel } from "../SettingRenderer.styles";
import { googleMapsLinkForLatLon, textFieldStyles } from "@envisio/ui";
import { ModelObject, GeographicCoords } from "./types";

interface TransformLocationSectionProps {
  object: ModelObject;
  geographicCoords: GeographicCoords | null;
  onPropertyChange: (property: string, value: number) => void;
  updateObjectProperty: (id: string, property: string, value: unknown) => void;
}

const TransformLocationSection: React.FC<TransformLocationSectionProps> = ({
  object,
  geographicCoords,
  onPropertyChange,
  updateObjectProperty,
}) => {
  return (
    <SettingContainer>
      <SettingLabel>Transform & Location</SettingLabel>

      {/* View on Google Maps - shown first if coordinates available */}
      {geographicCoords && (
        <Button
          variant="outlined"
          startIcon={<LocationOn />}
          href={googleMapsLinkForLatLon(
            geographicCoords.latitude,
            geographicCoords.longitude
          )}
          target="_blank"
          rel="noopener noreferrer"
          fullWidth
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 500,
            fontSize: "0.75rem",
            borderColor: "rgba(37, 99, 235, 0.3)",
            color: "#2563eb",
            padding: "6px 16px",
            mb: 2,
            "&:hover": {
              borderColor: "#2563eb",
              backgroundColor: "rgba(37, 99, 235, 0.08)",
            },
          }}
        >
          View on Google Maps
        </Button>
      )}

      {/* Geographic Coordinates - editable for Cesium */}
      <Box sx={{ mb: 2 }}>
        <Typography
          sx={{
            fontSize: "0.75rem",
            fontWeight: 500,
            color: "rgba(100, 116, 139, 0.8)",
            mb: 0.75,
          }}
        >
          Geographic Coordinates
        </Typography>
        <Box display="flex" gap={1}>
          <TextField
            label="Longitude"
            type="number"
            value={object.position?.[0] || 0}
            onChange={(e) => {
              const value = Number(e.target.value);
              const clampedValue = Math.max(-180, Math.min(180, value));
              onPropertyChange("position.0", clampedValue);
            }}
            size="small"
            inputProps={{
              step: 0.000001,
              min: -180,
              max: 180,
            }}
            sx={{ ...textFieldStyles, flex: 1 }}
          />
          <TextField
            label="Latitude"
            type="number"
            value={object.position?.[1] || 0}
            onChange={(e) => {
              const value = Number(e.target.value);
              const clampedValue = Math.max(-90, Math.min(90, value));
              onPropertyChange("position.1", clampedValue);
            }}
            size="small"
            inputProps={{
              step: 0.000001,
              min: -90,
              max: 90,
            }}
            sx={{ ...textFieldStyles, flex: 1 }}
          />
          <TextField
            label="Altitude (m)"
            type="number"
            value={object.position?.[2] || 0}
            onChange={(e) => {
              const value = Number(e.target.value);
              const clampedValue = Math.max(-1000, Math.min(100000, value));
              onPropertyChange("position.2", clampedValue);
            }}
            size="small"
            inputProps={{
              step: 0.1,
              min: -1000,
              max: 100000,
            }}
            sx={{ ...textFieldStyles, flex: 1 }}
          />
        </Box>
      </Box>

      {/* Rotation */}
      <Box sx={{ mb: 2 }}>
        <Typography
          sx={{
            fontSize: "0.75rem",
            fontWeight: 500,
            color: "rgba(100, 116, 139, 0.8)",
            mb: 0.75,
          }}
        >
          Rotation
        </Typography>
        <Box display="flex" gap={1}>
          <TextField
            size="small"
            label="X"
            type="number"
            value={object.rotation?.[0] || 0}
            onChange={(e) =>
              onPropertyChange("rotation.0", Number(e.target.value))
            }
            inputProps={{ step: 0.01 }}
            sx={{ ...textFieldStyles, flex: 1 }}
          />
          <TextField
            size="small"
            label="Y"
            type="number"
            value={object.rotation?.[1] || 0}
            onChange={(e) =>
              onPropertyChange("rotation.1", Number(e.target.value))
            }
            inputProps={{ step: 0.01 }}
            sx={{ ...textFieldStyles, flex: 1 }}
          />
          <TextField
            size="small"
            label="Z"
            type="number"
            value={object.rotation?.[2] || 0}
            onChange={(e) =>
              onPropertyChange("rotation.2", Number(e.target.value))
            }
            inputProps={{ step: 0.01 }}
            sx={{ ...textFieldStyles, flex: 1 }}
          />
        </Box>
      </Box>

      {/* Scale */}
      <Box>
        <Typography
          sx={{
            fontSize: "0.75rem",
            fontWeight: 500,
            color: "rgba(100, 116, 139, 0.8)",
            mb: 0.75,
          }}
        >
          Scale (Uniform)
        </Typography>
        <TextField
          size="small"
          label="Scale"
          type="number"
          value={object.scale?.[0] || 1}
          onChange={(e) => {
            const value = Number(e.target.value);
            const uniformScale = [value, value, value];
            updateObjectProperty(object.id, "scale", uniformScale);
          }}
          inputProps={{
            step: 0.01,
            min: 0.01,
            max: 100,
          }}
          fullWidth
          sx={textFieldStyles}
        />
      </Box>
    </SettingContainer>
  );
};

export default TransformLocationSection;
