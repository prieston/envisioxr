import React from "react";
import { Box } from "@mui/material";

export interface PageProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Main page wrapper component for dashboard pages.
 * Provides consistent layout structure and spacing.
 */
export const Page: React.FC<PageProps> = ({ children, className }) => {
  return (
    <Box
      className={className}
      sx={{
        marginLeft: "392px", // Account for sidebar width
        padding: "24px",
        paddingX: 0, // Remove horizontal padding - content will handle its own padding
        minHeight: "100vh",
        position: "relative",
        zIndex: 1,
      }}
    >
      <Box
        sx={{
          paddingX: "24px", // Apply horizontal padding to inner container
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

