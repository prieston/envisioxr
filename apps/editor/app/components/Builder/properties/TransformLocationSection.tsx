import React, { useState } from "react";
import { Box, Typography, Button, TextField } from "@mui/material";
import { LocationOn } from "@mui/icons-material";
import { SettingContainer, SettingLabel } from "../SettingRenderer.styles";
import { googleMapsLinkForLatLon, textFieldStyles } from "@envisio/ui";
import { ModelObject, GeographicCoords } from "./types";
import { useSceneStore } from "@envisio/core";

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

const TransformLocationSection: React.FC<TransformLocationSectionProps> =
  React.memo(
    ({ object, geographicCoords, onPropertyChange, updateObjectProperty }) => {
      const liveObject =
        useSceneStore((s) => s.objects.find((o) => o.id === object.id)) ||
        object;

      // String-based local state while editing
      const [editing, setEditing] = useState<string | null>(null);
      const [localStr, setLocalStr] = useState<Record<string, string>>({});

      return (
        <SettingContainer>
          <SettingLabel>Transform & Location</SettingLabel>

          {/* View on Google Maps */}
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
                borderColor: "rgba(95, 136, 199, 0.3)",
                color: "var(--color-primary, #6B9CD8)",
                padding: "6px 16px",
                mb: 2,
                "&:hover": {
                  borderColor: "var(--color-primary, #6B9CD8)",
                  backgroundColor: "rgba(95, 136, 199, 0.08)",
                },
              }}
            >
              View on Google Maps
            </Button>
          )}

          {/* Geographic Coordinates */}
          <Box sx={{ mb: 2 }}>
            <Box display="flex" gap={1}>
              <Box sx={{ flex: 1 }}>
                <InputLabel>Longitude</InputLabel>
                <TextField
                  id={`object-longitude-${object.id}`}
                  name="object-longitude"
                  type="number"
                  value={
                    editing === "lon"
                      ? localStr.lon
                      : (liveObject.position?.[0] ?? 0)
                  }
                  onFocus={(e) => {
                    setEditing("lon");
                    setLocalStr((prev) => ({ ...prev, lon: e.target.value }));
                  }}
                  onChange={(e) => {
                    setLocalStr((prev) => ({ ...prev, lon: e.target.value }));
                  }}
                  onBlur={() => {
                    const val = Number(localStr.lon);
                    if (!isNaN(val)) {
                      onPropertyChange("position.0", val);
                    }
                    setEditing(null);
                  }}
                  size="small"
                  inputProps={{ step: 0.000001 }}
                  fullWidth
                  sx={textFieldStyles}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <InputLabel>Latitude</InputLabel>
                <TextField
                  id={`object-latitude-${object.id}`}
                  name="object-latitude"
                  type="number"
                  value={
                    editing === "lat"
                      ? localStr.lat
                      : (liveObject.position?.[1] ?? 0)
                  }
                  onFocus={(e) => {
                    setEditing("lat");
                    setLocalStr((prev) => ({ ...prev, lat: e.target.value }));
                  }}
                  onChange={(e) => {
                    setLocalStr((prev) => ({ ...prev, lat: e.target.value }));
                  }}
                  onBlur={() => {
                    const val = Number(localStr.lat);
                    if (!isNaN(val)) {
                      onPropertyChange("position.1", val);
                    }
                    setEditing(null);
                  }}
                  size="small"
                  inputProps={{ step: 0.000001 }}
                  fullWidth
                  sx={textFieldStyles}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <InputLabel>Altitude (m)</InputLabel>
                <TextField
                  id={`object-altitude-${object.id}`}
                  name="object-altitude"
                  type="number"
                  value={
                    editing === "alt"
                      ? localStr.alt
                      : (liveObject.position?.[2] ?? 0)
                  }
                  onFocus={(e) => {
                    setEditing("alt");
                    setLocalStr((prev) => ({ ...prev, alt: e.target.value }));
                  }}
                  onChange={(e) => {
                    setLocalStr((prev) => ({ ...prev, alt: e.target.value }));
                  }}
                  onBlur={() => {
                    const val = Number(localStr.alt);
                    if (!isNaN(val)) {
                      onPropertyChange("position.2", val);
                    }
                    setEditing(null);
                  }}
                  size="small"
                  inputProps={{ step: 0.1 }}
                  fullWidth
                  sx={textFieldStyles}
                />
              </Box>
            </Box>
          </Box>

          {/* Rotation */}
          <Box sx={{ mb: 2 }}>
            <Box display="flex" gap={1}>
              <Box sx={{ flex: 1 }}>
                <InputLabel>X Rotation</InputLabel>
                <TextField
                  id={`object-rotation-x-${object.id}`}
                  name="object-rotation-x"
                  type="number"
                  value={
                    editing === "rotX"
                      ? localStr.rotX
                      : (liveObject.rotation?.[0] ?? 0)
                  }
                  onFocus={(e) => {
                    setEditing("rotX");
                    setLocalStr((prev) => ({ ...prev, rotX: e.target.value }));
                  }}
                  onChange={(e) => {
                    setLocalStr((prev) => ({ ...prev, rotX: e.target.value }));
                  }}
                  onBlur={() => {
                    const val = Number(localStr.rotX);
                    if (!isNaN(val)) {
                      onPropertyChange("rotation.0", val);
                    }
                    setEditing(null);
                  }}
                  size="small"
                  inputProps={{ step: 0.01 }}
                  fullWidth
                  sx={textFieldStyles}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <InputLabel>Y Rotation</InputLabel>
                <TextField
                  id={`object-rotation-y-${object.id}`}
                  name="object-rotation-y"
                  type="number"
                  value={
                    editing === "rotY"
                      ? localStr.rotY
                      : (liveObject.rotation?.[1] ?? 0)
                  }
                  onFocus={(e) => {
                    setEditing("rotY");
                    setLocalStr((prev) => ({ ...prev, rotY: e.target.value }));
                  }}
                  onChange={(e) => {
                    setLocalStr((prev) => ({ ...prev, rotY: e.target.value }));
                  }}
                  onBlur={() => {
                    const val = Number(localStr.rotY);
                    if (!isNaN(val)) {
                      onPropertyChange("rotation.1", val);
                    }
                    setEditing(null);
                  }}
                  size="small"
                  inputProps={{ step: 0.01 }}
                  fullWidth
                  sx={textFieldStyles}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <InputLabel>Z Rotation</InputLabel>
                <TextField
                  id={`object-rotation-z-${object.id}`}
                  name="object-rotation-z"
                  type="number"
                  value={
                    editing === "rotZ"
                      ? localStr.rotZ
                      : (liveObject.rotation?.[2] ?? 0)
                  }
                  onFocus={(e) => {
                    setEditing("rotZ");
                    setLocalStr((prev) => ({ ...prev, rotZ: e.target.value }));
                  }}
                  onChange={(e) => {
                    setLocalStr((prev) => ({ ...prev, rotZ: e.target.value }));
                  }}
                  onBlur={() => {
                    const val = Number(localStr.rotZ);
                    if (!isNaN(val)) {
                      onPropertyChange("rotation.2", val);
                    }
                    setEditing(null);
                  }}
                  size="small"
                  inputProps={{ step: 0.01 }}
                  fullWidth
                  sx={textFieldStyles}
                />
              </Box>
            </Box>
          </Box>

          {/* Scale */}
          <Box>
            <InputLabel>Scale (Uniform)</InputLabel>
            <TextField
              id={`object-scale-${object.id}`}
              name="object-scale"
              type="number"
              value={
                editing === "scale"
                  ? localStr.scale
                  : (liveObject.scale?.[0] ?? 1)
              }
              onFocus={(e) => {
                setEditing("scale");
                setLocalStr((prev) => ({ ...prev, scale: e.target.value }));
              }}
              onChange={(e) => {
                setLocalStr((prev) => ({ ...prev, scale: e.target.value }));
              }}
              onBlur={() => {
                const val = Number(localStr.scale);
                if (!isNaN(val)) {
                  updateObjectProperty(object.id, "scale", [val, val, val]);
                }
                setEditing(null);
              }}
              size="small"
              inputProps={{ step: 0.01 }}
              fullWidth
              sx={textFieldStyles}
            />
          </Box>
        </SettingContainer>
      );
    }
  );

TransformLocationSection.displayName = "TransformLocationSection";

export default TransformLocationSection;
