import React from "react";
import { Box, Typography } from "@mui/material";

export const PropertyGroup: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <Box mb={2}>{children}</Box>;

export const PropertyLabel: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <Typography fontSize="0.875rem" color="text.secondary" mb={0.5}>
    {children}
  </Typography>
);

export const InputLabel: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <Typography
    sx={{
      fontSize: "0.75rem",
      fontWeight: 500,
      color: "rgba(100, 116, 139, 0.8)",
      mb: 0.75,
    }}
  >
    {children}
  </Typography>
);

export const InfoText: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <Box sx={{ mb: 1.5 }}>
    <Typography
      sx={{
        fontSize: "0.75rem",
        fontWeight: 500,
        color: "rgba(100, 116, 139, 0.8)",
        mb: 0.75,
      }}
    >
      {label}
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
        border: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      {value}
    </Typography>
  </Box>
);
