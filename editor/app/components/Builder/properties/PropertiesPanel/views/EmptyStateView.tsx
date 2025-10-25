import React, { memo } from "react";
import { Paper, Typography } from "@mui/material";

/**
 * EmptyStateView - Displays when no object is selected
 * Memoized since it has no props and never needs to re-render
 */
export const EmptyStateView: React.FC = memo(() => {
  return (
    <Paper
      sx={{
        p: 3,
        textAlign: "center",
        backgroundColor: "rgba(248, 250, 252, 0.4)",
        border: "1px dashed rgba(226, 232, 240, 0.6)",
        borderRadius: "12px",
      }}
    >
      <Typography
        sx={{
          fontSize: "0.875rem",
          color: "rgba(100, 116, 139, 0.7)",
          fontStyle: "italic",
        }}
      >
        Select an object or observation point to view its properties
      </Typography>
    </Paper>
  );
});

EmptyStateView.displayName = "EmptyStateView";
