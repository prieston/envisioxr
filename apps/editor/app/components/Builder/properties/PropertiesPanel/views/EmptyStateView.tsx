import React, { memo } from "react";
import { Box, Typography } from "@mui/material";

/**
 * EmptyStateView - Displays when no object is selected
 * Memoized since it has no props and never needs to re-render
 */
export const EmptyStateView: React.FC = memo(() => {
  return (
    <Box
      sx={{
        p: 3,
        textAlign: "center",
      }}
    >
      <Typography
        sx={(theme) => ({
          fontSize: "0.875rem",
          color: theme.palette.text.secondary,
          fontStyle: "italic",
        })}
      >
        Select an object or observation point to view its properties
      </Typography>
    </Box>
  );
});

EmptyStateView.displayName = "EmptyStateView";
