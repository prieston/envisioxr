"use client";

import { Box, Typography } from "@mui/material";
import { InfoIcon } from "@klorad/ui";

interface LocationNotSetNotificationProps {
  visible: boolean;
}

/**
 * Notification component to inform users that the asset doesn't have a location set
 */
export function LocationNotSetNotification({
  visible,
}: LocationNotSetNotificationProps) {
  if (!visible) return null;

  return (
    <Box
      sx={{
        position: "absolute",
        top: 16,
        left: 16,
        right: 16,
        zIndex: 20,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        borderRadius: "4px",
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        border: "1px solid rgba(255, 255, 255, 0.1)",
        maxWidth: "600px",
      }}
    >
      <InfoIcon
        sx={{
          color: "warning.main",
          fontSize: "1.25rem",
          flexShrink: 0,
        }}
      />
      <Typography
        sx={{
          color: "text.primary",
          fontSize: "0.875rem",
          fontWeight: 500,
          lineHeight: 1.5,
        }}
      >
        This asset does not have location set. Adjust the tileset location in
        our location editor.
      </Typography>
    </Box>
  );
}

