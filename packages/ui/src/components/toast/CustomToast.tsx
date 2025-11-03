"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import { CheckCircle, Error, Warning, Info } from "@mui/icons-material";

interface CustomToastProps {
  message: string;
  type: "success" | "error" | "warning" | "info";
}

const iconMap = {
  success: CheckCircle,
  error: Error,
  warning: Warning,
  info: Info,
};

const colorMap = {
  success: "rgba(34, 197, 94, 1)",
  error: "rgba(255, 86, 86, 1)",
  warning: "rgba(245, 158, 11, 1)",
  info: "rgba(107, 156, 216, 1)",
};

export const CustomToast: React.FC<CustomToastProps> = ({ message, type }) => {
  const Icon = iconMap[type];
  const color = colorMap[type];

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
      }}
    >
      <Icon sx={{ color, fontSize: "20px", flexShrink: 0 }} />
      <Typography
        sx={{
          fontSize: "0.875rem",
          lineHeight: 1.5,
          color: "inherit",
        }}
      >
        {message}
      </Typography>
    </Box>
  );
};

