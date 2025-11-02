"use client";

import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Check, Close, TouchApp } from "@mui/icons-material";

interface ModelPositioningOverlayProps {
  modelName: string;
  selectedPosition: [number, number, number] | null;
  onConfirm: () => void;
  onCancel: () => void;
  isRepositioning?: boolean;
}

const ModelPositioningOverlay: React.FC<ModelPositioningOverlayProps> = ({
  modelName,
  selectedPosition,
  onConfirm,
  onCancel,
  isRepositioning = false,
}) => {
  return (
    <Box
      sx={{
        position: "fixed",
        top: "80px", // Below the topbar
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 2000,
        pointerEvents: "auto",
      }}
    >
      <Paper
        elevation={8}
        sx={(theme) => ({
          padding: "20px 24px",
          backgroundColor:
            theme.palette.mode === "dark"
              ? alpha("#0E0F10", 0.9)
              : "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderRadius: "16px",
          border: `1px solid ${
            theme.palette.mode === "dark"
              ? "rgba(255, 255, 255, 0.12)"
              : theme.palette.primary.main
          }`,
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 14px 42px rgba(10, 16, 24, 0.6)"
              : "0 8px 32px rgba(95, 136, 199, 0.25), 0 2px 8px rgba(0, 0, 0, 0.1)",
          minWidth: "400px",
          maxWidth: "600px",
        })}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 2,
          }}
        >
          <TouchApp
            sx={(theme) => ({ color: theme.palette.primary.main, fontSize: "24px" })}
          />
          <Typography
            variant="h6"
            sx={(theme) => ({
              fontSize: "1rem",
              fontWeight: 600,
              color:
                theme.palette.mode === "dark"
                  ? theme.palette.text.primary
                  : "rgba(51, 65, 85, 0.95)",
            })}
          >
            {isRepositioning
              ? `Reposition: ${modelName}`
              : `Position Model: ${modelName}`}
          </Typography>
        </Box>

        {/* Instructions */}
        {!selectedPosition ? (
          <Typography
            sx={(theme) => ({
              fontSize: "0.875rem",
              color:
                theme.palette.mode === "dark"
                  ? theme.palette.text.secondary
                  : "rgba(100, 116, 139, 0.9)",
              mb: 2,
              lineHeight: 1.5,
            })}
          >
            {isRepositioning
              ? "Click anywhere on the scene to select the new position for this object."
              : "Click anywhere on the scene to select the placement position for your model."}
          </Typography>
        ) : (
          <Box sx={{ mb: 2 }}>
            <Typography
              sx={(theme) => ({
                fontSize: "0.875rem",
                color:
                  theme.palette.mode === "dark"
                    ? theme.palette.text.secondary
                    : "rgba(100, 116, 139, 0.9)",
                mb: 1,
              })}
            >
              Selected Position:
            </Typography>
            <Box
              sx={(theme) => ({
                display: "flex",
                gap: 2,
                backgroundColor: alpha(theme.palette.primary.main, 0.12),
                padding: "12px 16px",
                borderRadius: "8px",
                border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
              })}
            >
              <Typography
                sx={(theme) => ({
                  fontSize: "0.813rem",
                  fontWeight: 600,
                  color: theme.palette.primary.main,
                })}
              >
                X: {selectedPosition[0].toFixed(3)}
              </Typography>
              <Typography
                sx={(theme) => ({
                  fontSize: "0.813rem",
                  fontWeight: 600,
                  color: theme.palette.primary.main,
                })}
              >
                Y: {selectedPosition[1].toFixed(3)}
              </Typography>
              <Typography
                sx={(theme) => ({
                  fontSize: "0.813rem",
                  fontWeight: 600,
                  color: theme.palette.primary.main,
                })}
              >
                Z: {selectedPosition[2].toFixed(3)}
              </Typography>
            </Box>
            <Typography
              sx={{
                fontSize: "0.75rem",
                color: "rgba(100, 116, 139, 0.7)",
                mt: 1,
                fontStyle: "italic",
              }}
            >
              {isRepositioning
                ? "Click elsewhere to change position, or confirm to reposition the object."
                : "Click elsewhere to change position, or confirm to place the model."}
            </Typography>
          </Box>
        )}

        {/* Action Buttons */}
        <Box
          sx={{
            display: "flex",
            gap: 1,
            justifyContent: "flex-end",
          }}
        >
          <Button
            variant="outlined"
            startIcon={<Close />}
            onClick={onCancel}
            sx={(theme) => ({
              textTransform: "none",
              borderRadius: "8px",
              borderColor:
                theme.palette.mode === "dark"
                  ? alpha(theme.palette.error.main, 0.4)
                  : "rgba(100, 116, 139, 0.3)",
              color:
                theme.palette.mode === "dark"
                  ? alpha(theme.palette.error.main, 0.85)
                  : "rgba(100, 116, 139, 0.8)",
              fontSize: "0.813rem",
              fontWeight: 500,
              padding: "6px 16px",
              "&:hover": {
                borderColor: theme.palette.error.main,
                backgroundColor: alpha(theme.palette.error.main, 0.12),
                color: theme.palette.error.main,
              },
            })}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<Check />}
            onClick={onConfirm}
            disabled={!selectedPosition}
            sx={(theme) => ({
              textTransform: "none",
              borderRadius: "8px",
              backgroundColor: theme.palette.primary.main,
              fontSize: "0.813rem",
              fontWeight: 500,
              padding: "6px 16px",
              boxShadow:
                theme.palette.mode === "dark"
                  ? "0 8px 24px rgba(0, 0, 0, 0.45)"
                  : "0 4px 12px rgba(95, 136, 199, 0.3)",
              color: theme.palette.getContrastText(theme.palette.primary.main),
              "&:hover": {
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? alpha(theme.palette.primary.main, 0.85)
                    : "#1d4ed8",
                boxShadow:
                  theme.palette.mode === "dark"
                    ? "0 10px 28px rgba(0, 0, 0, 0.5)"
                    : "0 6px 16px rgba(95, 136, 199, 0.4)",
              },
              "&:disabled": {
                backgroundColor: alpha(theme.palette.text.secondary, 0.25),
                color: alpha(theme.palette.text.secondary, 0.55),
                boxShadow: "none",
              },
            })}
          >
            Confirm Position
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ModelPositioningOverlay;
