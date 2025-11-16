import React from "react";
import { Typography, Box } from "@mui/material";

export interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

/**
 * Small KPI card component for dashboard metrics.
 * Displays icon, number, and label in a compact format.
 * Uses the same styling as PageCard for consistency.
 */
export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  icon,
  trend,
  className,
}) => {
  return (
    <Box
      className={className}
      sx={(theme) => ({
        p: 2,
        backgroundColor: "#161B20",
        border: "1px solid rgba(255, 255, 255, 0.04)",
        borderRadius: `${theme.shape.borderRadius}px`,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        minHeight: "100px",
        boxShadow: "none",
        transition: "all 0.2s ease",
        "&:hover": {
          borderColor: "rgba(255, 255, 255, 0.04)",
        },
      })}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {icon && (
          <Box
            sx={{
              color: "rgba(255, 255, 255, 0.55)",
              display: "flex",
              alignItems: "center",
            }}
          >
            {icon}
          </Box>
        )}
        {trend && (
          <Typography
            variant="caption"
            sx={{
              color: trend.isPositive ? "#22c55e" : "#ef4444",
              fontSize: "0.75rem",
              fontWeight: 500,
            }}
          >
            {trend.isPositive ? "+" : ""}
            {trend.value}%
          </Typography>
        )}
      </Box>
      <Typography
        variant="h4"
        sx={{
          fontSize: "24px",
          fontWeight: 600,
          color: "text.primary",
          lineHeight: 1.2,
        }}
      >
        {value}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontSize: "0.875rem",
          color: "rgba(255, 255, 255, 0.6)",
          fontWeight: 400,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
};

