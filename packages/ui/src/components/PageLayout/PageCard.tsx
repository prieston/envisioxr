import React from "react";
import { Box } from "@mui/material";

export interface PageCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: number;
}

/**
 * Card component for content surfaces.
 * Uses glass morphism styling with bg-[#111319], border border-white/5, rounded-xl.
 * Consistent with enterprise design patterns.
 */
export const PageCard: React.FC<PageCardProps> = ({
  children,
  className,
  padding = 3,
}) => {
  return (
    <Box
      className={className}
      sx={(theme) => ({
        p: padding,
        backgroundColor: "#161B20",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        borderRadius: `${theme.shape.borderRadius}px`,
        boxShadow: "none",
        color: theme.palette.text.primary, // Ensure text color is set from theme
        "&:hover": {
          borderColor: "rgba(255, 255, 255, 0.04)",
        },
      })}
    >
      {children}
    </Box>
  );
};

