import React from "react";
import { Box, Typography, useTheme } from "@mui/material";

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
}) => {
  const theme = useTheme();
  return (
    <Typography
      sx={{
        fontSize: "0.75rem",
        fontWeight: 500,
        color: theme.palette.text.secondary,
        mb: 0.75,
      }}
    >
      {children}
    </Typography>
  );
};

export const InfoText: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => {
  const theme = useTheme();
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography
        sx={{
          fontSize: "0.75rem",
          fontWeight: 500,
          color: theme.palette.text.secondary,
          mb: 0.75,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: "0.75rem",
          fontWeight: 400,
          color: theme.palette.text.primary,
          fontFamily: "monospace",
          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(255, 255, 255, 0.05)"
              : theme.palette.background.paper,
          padding: "6px 12px",
          borderRadius: "6px",
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
};
