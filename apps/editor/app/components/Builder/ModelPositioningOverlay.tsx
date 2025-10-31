"use client";

import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
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
        sx={{
          padding: "20px 24px",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderRadius: "16px",
          border: "2px solid #2563eb",
          boxShadow:
            "0 8px 32px rgba(37, 99, 235, 0.25), 0 2px 8px rgba(0, 0, 0, 0.1)",
          minWidth: "400px",
          maxWidth: "600px",
        }}
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
          <TouchApp sx={{ color: "#2563eb", fontSize: "24px" }} />
          <Typography
            variant="h6"
            sx={{
              fontSize: "1rem",
              fontWeight: 600,
              color: "rgba(51, 65, 85, 0.95)",
            }}
          >
            {isRepositioning
              ? `Reposition: ${modelName}`
              : `Position Model: ${modelName}`}
          </Typography>
        </Box>

        {/* Instructions */}
        {!selectedPosition ? (
          <Typography
            sx={{
              fontSize: "0.875rem",
              color: "rgba(100, 116, 139, 0.9)",
              mb: 2,
              lineHeight: 1.5,
            }}
          >
            {isRepositioning
              ? "Click anywhere on the scene to select the new position for this object."
              : "Click anywhere on the scene to select the placement position for your model."}
          </Typography>
        ) : (
          <Box sx={{ mb: 2 }}>
            <Typography
              sx={{
                fontSize: "0.875rem",
                color: "rgba(100, 116, 139, 0.9)",
                mb: 1,
              }}
            >
              Selected Position:
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                backgroundColor: "rgba(37, 99, 235, 0.08)",
                padding: "12px 16px",
                borderRadius: "8px",
                border: "1px solid rgba(37, 99, 235, 0.2)",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.813rem",
                  fontWeight: 600,
                  color: "#2563eb",
                }}
              >
                X: {selectedPosition[0].toFixed(3)}
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.813rem",
                  fontWeight: 600,
                  color: "#2563eb",
                }}
              >
                Y: {selectedPosition[1].toFixed(3)}
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.813rem",
                  fontWeight: 600,
                  color: "#2563eb",
                }}
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
            sx={{
              textTransform: "none",
              borderRadius: "8px",
              borderColor: "rgba(100, 116, 139, 0.3)",
              color: "rgba(100, 116, 139, 0.8)",
              fontSize: "0.813rem",
              fontWeight: 500,
              padding: "6px 16px",
              "&:hover": {
                borderColor: "#ef4444",
                backgroundColor: "rgba(239, 68, 68, 0.08)",
                color: "#ef4444",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<Check />}
            onClick={onConfirm}
            disabled={!selectedPosition}
            sx={{
              textTransform: "none",
              borderRadius: "8px",
              backgroundColor: "#2563eb",
              fontSize: "0.813rem",
              fontWeight: 500,
              padding: "6px 16px",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
              "&:hover": {
                backgroundColor: "#1d4ed8",
                boxShadow: "0 6px 16px rgba(37, 99, 235, 0.4)",
              },
              "&:disabled": {
                backgroundColor: "rgba(100, 116, 139, 0.2)",
                color: "rgba(100, 116, 139, 0.5)",
              },
            }}
          >
            Confirm Position
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ModelPositioningOverlay;
