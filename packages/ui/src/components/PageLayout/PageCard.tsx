import React from "react";
import { Paper } from "@mui/material";

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
    <Paper
      className={className}
      style={{
        backgroundColor: "rgba(20, 23, 26, 0.92)",
      }}
      sx={(theme) => ({
        p: padding,
        border: "1px solid rgba(255, 255, 255, 0.05) !important",
        borderRadius: `${theme.shape.borderRadius}px !important`,
        boxShadow: "none !important",
        // Override MUI Paper default background with higher specificity
        backgroundColor: "rgba(20, 23, 26, 0.92) !important",
        "&.MuiPaper-root": {
          backgroundColor: "rgba(20, 23, 26, 0.92) !important",
          borderRadius: `${theme.shape.borderRadius}px !important`,
        },
      })}
    >
      {children}
    </Paper>
  );
};

