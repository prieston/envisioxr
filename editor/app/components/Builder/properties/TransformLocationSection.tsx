import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { LocationOn } from "@mui/icons-material";
import { SettingContainer, SettingLabel } from "../SettingRenderer.styles";
import { googleMapsLinkForLatLon } from "@envisio/ui";
import { ModelObject, GeographicCoords } from "./types";

interface TransformLocationSectionProps {
  object: ModelObject;
  geographicCoords: GeographicCoords | null;
  onPropertyChange: (property: string, value: number) => void;
  updateObjectProperty: (id: string, property: string, value: unknown) => void;
}

// Read-only info display component
const InfoDisplay = (props: { label: string; value: string }) => (
  <Box sx={{ flex: 1 }}>
    <Typography
      sx={{
        fontSize: "0.75rem",
        fontWeight: 500,
        color: "rgba(100, 116, 139, 0.8)",
        mb: 0.5,
      }}
    >
      {props.label}
    </Typography>
    <Typography
      sx={{
        fontSize: "0.75rem",
        fontWeight: 400,
        color: "rgba(51, 65, 85, 0.9)",
        fontFamily: "monospace",
        backgroundColor: "rgba(248, 250, 252, 0.8)",
        padding: "6px 12px",
        borderRadius: "6px",
        border: "1px solid rgba(226, 232, 240, 0.8)",
      }}
    >
      {props.value}
    </Typography>
  </Box>
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

      {/* Geographic Coordinates - Read Only */}
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
          <InfoDisplay
            label="Longitude"
            value={(object.position?.[0] || 0).toFixed(6)}
          />
          <InfoDisplay
            label="Latitude"
            value={(object.position?.[1] || 0).toFixed(6)}
          />
          <InfoDisplay
            label="Altitude (m)"
            value={(object.position?.[2] || 0).toFixed(2)}
          />
        </Box>
      </Box>

      {/* Rotation - Read Only */}
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
          <InfoDisplay
            label="X"
            value={(object.rotation?.[0] || 0).toFixed(2)}
          />
          <InfoDisplay
            label="Y"
            value={(object.rotation?.[1] || 0).toFixed(2)}
          />
          <InfoDisplay
            label="Z"
            value={(object.rotation?.[2] || 0).toFixed(2)}
          />
        </Box>
      </Box>

      {/* Scale - Read Only */}
      <Box>
        <Typography
          sx={{
            fontSize: "0.75rem",
            fontWeight: 500,
            color: "rgba(100, 116, 139, 0.8)",
            mb: 0.75,
          }}
        >
          Scale
        </Typography>
        <Box display="flex" gap={1}>
          <InfoDisplay label="X" value={(object.scale?.[0] || 1).toFixed(2)} />
          <InfoDisplay label="Y" value={(object.scale?.[1] || 1).toFixed(2)} />
          <InfoDisplay label="Z" value={(object.scale?.[2] || 1).toFixed(2)} />
        </Box>
      </Box>
    </SettingContainer>
  );
};

export default TransformLocationSection;
