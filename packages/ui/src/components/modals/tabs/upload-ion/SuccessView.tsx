import React from "react";
import { Box, Button, Typography, Paper, Alert } from "@mui/material";
import { Public } from "@mui/icons-material";
import { alpha, useTheme } from "@mui/material/styles";

interface SuccessViewProps {
  assetId: string;
  onReset: () => void;
}

export const SuccessView: React.FC<SuccessViewProps> = ({ assetId, onReset }) => {
  const theme = useTheme();
  const accent = theme.palette.primary.main;
  const accentBorder = alpha(accent, 0.4);
  const accentSoft = alpha(accent, 0.08);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "400px",
        gap: 3,
      }}
    >
      <Box
        sx={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Public sx={{ fontSize: "2.5rem", color: "#22c55e" }} />
      </Box>
      <Typography
        sx={{
          fontSize: "1.25rem",
          fontWeight: 600,
          color: "rgba(51, 65, 85, 0.95)",
        }}
      >
        Successfully uploaded to Cesium Ion!
      </Typography>
      <Paper
        sx={(theme) => ({
          p: 2,
          borderRadius: "4px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          backgroundColor: theme.palette.background.paper,
        })}
      >
        <Typography
          sx={{
            fontSize: "0.875rem",
            color: "rgba(100, 116, 139, 0.8)",
            mb: 0.5,
          }}
        >
          Asset ID:
        </Typography>
        <Typography
          sx={{
            fontSize: "1rem",
            fontWeight: 600,
            color: accent,
            fontFamily: "monospace",
          }}
        >
          {assetId}
        </Typography>
      </Paper>
      <Alert severity="info" sx={{ width: "100%", maxWidth: "500px" }}>
        Your model is now being processed by Cesium Ion. This may take a few
        minutes. You can add this asset using the &quot;Cesium Ion Asset&quot; tab.
      </Alert>
      <Button
        variant="outlined"
        onClick={onReset}
        sx={{
          borderRadius: "4px",
          textTransform: "none",
          fontWeight: 500,
          fontSize: "0.875rem",
          borderColor: accentBorder,
          color: accent,
          "&:hover": {
            borderColor: accent,
            backgroundColor: accentSoft,
          },
        }}
      >
        Upload Another Model
      </Button>
    </Box>
  );
};

