import React from "react";
import { Box, Typography, TextField } from "@mui/material";
import { textFieldStyles } from "../../../../styles/inputStyles";

interface GeoreferencingFormProps {
  longitude: string;
  latitude: string;
  height: string;
  uploading: boolean;
  onLongitudeChange: (value: string) => void;
  onLatitudeChange: (value: string) => void;
  onHeightChange: (value: string) => void;
}

export const GeoreferencingForm: React.FC<GeoreferencingFormProps> = ({
  longitude,
  latitude,
  height,
  uploading,
  onLongitudeChange,
  onLatitudeChange,
  onHeightChange,
}) => {
  return (
    <>
      <Typography
        sx={(theme) => ({
          fontSize: "0.813rem",
          fontWeight: 600,
          color: theme.palette.text.primary,
          mt: 1,
        })}
      >
        Georeferencing (Optional)
      </Typography>

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}>
        <Box>
          <Typography
            sx={(theme) => ({
              fontSize: "0.75rem",
              fontWeight: 600,
              color: theme.palette.text.primary,
              mb: 0.5,
            })}
          >
            Longitude
          </Typography>
          <TextField
            id="georef-longitude"
            name="georef-longitude"
            fullWidth
            size="small"
            type="number"
            value={longitude}
            onChange={(e) => onLongitudeChange(e.target.value)}
            disabled={uploading}
            placeholder="0.0"
            inputProps={{ step: "0.000001", min: -180, max: 180 }}
            sx={textFieldStyles}
          />
        </Box>
        <Box>
          <Typography
            sx={(theme) => ({
              fontSize: "0.75rem",
              fontWeight: 600,
              color: theme.palette.text.primary,
              mb: 0.5,
            })}
          >
            Latitude
          </Typography>
          <TextField
            id="georef-latitude"
            name="georef-latitude"
            fullWidth
            size="small"
            type="number"
            value={latitude}
            onChange={(e) => onLatitudeChange(e.target.value)}
            disabled={uploading}
            placeholder="0.0"
            inputProps={{ step: "0.000001", min: -90, max: 90 }}
            sx={textFieldStyles}
          />
        </Box>
        <Box>
          <Typography
            sx={(theme) => ({
              fontSize: "0.75rem",
              fontWeight: 600,
              color: theme.palette.text.primary,
              mb: 0.5,
            })}
          >
            Height (m)
          </Typography>
          <TextField
            id="georef-height"
            name="georef-height"
            fullWidth
            size="small"
            type="number"
            value={height}
            onChange={(e) => onHeightChange(e.target.value)}
            disabled={uploading}
            placeholder="0"
            inputProps={{ step: "0.1" }}
            sx={textFieldStyles}
          />
        </Box>
      </Box>
    </>
  );
};

