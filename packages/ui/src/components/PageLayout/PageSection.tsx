import React from "react";
import { Box, Typography } from "@mui/material";

export interface PageSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  spacing?: "default" | "tight" | "loose";
}

/**
 * Section divider component for organizing content.
 * Uses spacing and muted titles instead of hard borders.
 * Follows enterprise design patterns (no full-width borders).
 */
export const PageSection: React.FC<PageSectionProps> = ({
  title,
  children,
  className,
  spacing = "default",
}) => {
  const spacingMap = {
    tight: { mt: 4, mb: 3, pt: 4 },
    default: { mt: 8, mb: 6, pt: 6 },
    loose: { mt: 12, mb: 8, pt: 8 },
  };

  return (
    <Box className={className} sx={spacingMap[spacing]}>
      {title && (
        <Typography
          variant="overline"
          sx={{
            fontSize: "0.75rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "rgba(255, 255, 255, 0.4)",
            display: "block",
            mb: 3,
          }}
        >
          {title}
        </Typography>
      )}
      {children}
    </Box>
  );
};

