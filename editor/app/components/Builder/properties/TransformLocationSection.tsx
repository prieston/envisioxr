import React from "react";
import { Box, Typography, Button, TextField } from "@mui/material";
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

// Label component for inputs
const InputLabel = (props: { children: React.ReactNode }) => (
  <Typography
    sx={{
      fontSize: "0.75rem",
      fontWeight: 500,
      color: "rgba(100, 116, 139, 0.8)",
      mb: 0.75,
    }}
  >
    {props.children}
  </Typography>
);

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

      {/* Geographic Coordinates - Editable */}
      <Box sx={{ mb: 2 }}>
        <Box display="flex" gap={1}>
          <Box sx={{ flex: 1 }}>
            <InputLabel>Longitude</InputLabel>
            <TextField
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
              fullWidth
              sx={textFieldStyles}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <InputLabel>Latitude</InputLabel>
            <TextField
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
              fullWidth
              sx={textFieldStyles}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <InputLabel>Altitude (m)</InputLabel>
            <TextField
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
              fullWidth
              sx={textFieldStyles}
            />
          </Box>
        </Box>
      </Box>

      {/* Rotation - Editable */}
      <Box sx={{ mb: 2 }}>
        <Box display="flex" gap={1}>
          <Box sx={{ flex: 1 }}>
            <InputLabel>X Rotation</InputLabel>
            <TextField
              size="small"
              type="number"
              value={object.rotation?.[0] || 0}
              onChange={(e) =>
                onPropertyChange("rotation.0", Number(e.target.value))
              }
              inputProps={{ step: 0.01 }}
              fullWidth
              sx={textFieldStyles}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <InputLabel>Y Rotation</InputLabel>
            <TextField
              size="small"
              type="number"
              value={object.rotation?.[1] || 0}
              onChange={(e) =>
                onPropertyChange("rotation.1", Number(e.target.value))
              }
              inputProps={{ step: 0.01 }}
              fullWidth
              sx={textFieldStyles}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <InputLabel>Z Rotation</InputLabel>
            <TextField
              size="small"
              type="number"
              value={object.rotation?.[2] || 0}
              onChange={(e) =>
                onPropertyChange("rotation.2", Number(e.target.value))
              }
              inputProps={{ step: 0.01 }}
              fullWidth
              sx={textFieldStyles}
            />
          </Box>
        </Box>
      </Box>

      {/* Scale - Editable (Uniform) */}
      <Box>
        <InputLabel>Scale (Uniform)</InputLabel>
        <TextField
          size="small"
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
