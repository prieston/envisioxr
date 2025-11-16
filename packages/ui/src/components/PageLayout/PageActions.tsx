import React from "react";
import { Box } from "@mui/material";

export interface PageActionsProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * CTA row component for page actions.
 * Actions are aligned to the right, with empty space on the left.
 * Positioned above the content surface with consistent spacing.
 */
export const PageActions: React.FC<PageActionsProps> = ({
  children,
  className,
}) => {
  return (
    <Box
      className={className}
      sx={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: 2,
        mt: 6,
        mb: 4,
      }}
    >
      {children}
    </Box>
  );
};

