import React from "react";
import { Box, Typography } from "@mui/material";

export interface ActivityItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  timestamp: string;
  className?: string;
}

/**
 * Activity feed item component for recent activity display.
 */
export const ActivityItem: React.FC<ActivityItemProps> = ({
  icon,
  title,
  description,
  timestamp,
  className,
}) => {
  return (
    <Box
      className={className}
      sx={{
        display: "flex",
        gap: 2,
        p: 2,
        borderRadius: "8px",
        transition: "background-color 0.2s ease",
        "&:hover": {
          backgroundColor: "rgba(255, 255, 255, 0.03)",
        },
      }}
    >
      <Box
        sx={{
          color: "rgba(255, 255, 255, 0.6)",
          display: "flex",
          alignItems: "flex-start",
          pt: 0.5,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            color: "text.primary",
            mb: 0.5,
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontSize: "0.875rem",
            color: "rgba(255, 255, 255, 0.6)",
            mb: 0.5,
          }}
        >
          {description}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            fontSize: "0.75rem",
            color: "rgba(255, 255, 255, 0.4)",
          }}
        >
          {timestamp}
        </Typography>
      </Box>
    </Box>
  );
};

