import { Box, Typography } from "@mui/material";
import type { Location } from "../utils/transform-utils";

interface CurrentLocationDisplayProps {
  location: Location;
}

export function CurrentLocationDisplay({
  location,
}: CurrentLocationDisplayProps) {
  return (
    <Box
      sx={{
        p: 1.5,
        backgroundColor: "rgba(107, 156, 216, 0.1)",
        borderRadius: "4px",
        border: "1px solid rgba(107, 156, 216, 0.2)",
      }}
    >
      <Typography
        sx={{
          fontSize: "0.75rem",
          fontWeight: 600,
          mb: 0.5,
        }}
      >
        Current Location:
      </Typography>
      <Typography sx={{ fontSize: "0.75rem" }}>
        Longitude: {location.longitude.toFixed(6)}, Latitude:{" "}
        {location.latitude.toFixed(6)}, Height: {location.height.toFixed(2)}m
      </Typography>
    </Box>
  );
}

