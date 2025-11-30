import { Box, Button, Typography } from "@mui/material";
import type { Location } from "../utils/transform-utils";

interface PositionConfirmationDialogProps {
  location: Location;
  onConfirm: () => void;
  onCancel: () => void;
}

export function PositionConfirmationDialog({
  location,
  onConfirm,
  onCancel,
}: PositionConfirmationDialogProps) {
  return (
    <Box
      sx={{
        position: "absolute",
        top: 16,
        left: 16,
        right: 16,
        zIndex: 25,
        backgroundColor: "rgba(107, 156, 216, 0.95)",
        borderRadius: "4px",
        padding: "12px 16px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
      }}
    >
      <Typography
        sx={{
          color: "white",
          fontSize: "0.875rem",
          fontWeight: 600,
          mb: 1,
        }}
      >
        Confirm Position
      </Typography>
      <Typography
        sx={{
          color: "white",
          fontSize: "0.75rem",
          mb: 2,
          fontFamily: "monospace",
        }}
      >
        Longitude: {location.longitude.toFixed(6)}
        <br />
        Latitude: {location.latitude.toFixed(6)}
        <br />
        Height: {location.height.toFixed(2)}m
      </Typography>
      <Box sx={{ display: "flex", gap: 1 }}>
        <Button
          variant="contained"
          size="small"
          onClick={onConfirm}
          sx={{
            textTransform: "none",
            fontSize: "0.75rem",
            backgroundColor: "white",
            color: "primary.main",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.9)",
            },
          }}
        >
          Confirm
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={onCancel}
          sx={{
            textTransform: "none",
            fontSize: "0.75rem",
            borderColor: "white",
            color: "white",
            "&:hover": {
              borderColor: "white",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            },
          }}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );
}

