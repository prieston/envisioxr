import React from "react";
import { Box } from "@mui/material";

export interface PageContentProps {
  children: React.ReactNode;
  maxWidth?: "5xl" | "6xl" | "full";
  className?: string;
}

/**
 * Content surface component for displaying tables, cards, grids, forms, etc.
 * Provides consistent card styling with glass morphism effect.
 * Content is constrained to max-width for better readability.
 */
export const PageContent: React.FC<PageContentProps> = ({
  children,
  maxWidth = "5xl",
  className,
}) => {
  const maxWidthMap = {
    "5xl": "1280px",
    "6xl": "1536px",
    full: "100%",
  };

  return (
    <Box
      className={className}
      sx={{
        maxWidth: maxWidthMap[maxWidth],
        mt: 6, // Add spacing from PageHeader/PageDescription
        // No mx: auto - align left with PageHeader
        // No horizontal padding - Page component already provides padding
      }}
    >
      {children}
    </Box>
  );
};

