"use client";

/* eslint-disable no-console */
import React, { useRef, useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Close, CameraAlt } from "@mui/icons-material";
import {
  modalPaperStyles,
  modalTitleStyles,
  modalTitleTextStyles,
  modalCloseButtonStyles,
} from "@klorad/ui";
import { captureCesiumScreenshot } from "@/app/utils/screenshotCapture";
import { CesiumMinimalViewer } from "@klorad/engine-cesium";

interface CesiumPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  cesiumAssetId: string;
  cesiumApiKey: string;
  assetName: string;
  assetType?: string; // e.g., "IMAGERY", "3DTILES", etc.
  onCapture: (screenshot: string) => void;
}

const CesiumPreviewDialog: React.FC<CesiumPreviewDialogProps> = ({
  open,
  onClose,
  cesiumAssetId,
  cesiumApiKey,
  assetName,
  assetType,
  onCapture,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleViewerReady = (viewer: any) => {
    viewerRef.current = viewer;
    setLoading(false);
  };

  const handleError = (err: Error) => {
    setError(err.message);
    setLoading(false);
  };

  // Reset state when dialog closes and clean up any existing canvases
  useEffect(() => {
    if (!open) {
      setLoading(true);
      setError(null);
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy();
        } catch (err) {
          // Ignore cleanup errors
        }
        viewerRef.current = null;
      }
      // Remove any existing Cesium viewers and elements from container
      if (containerRef.current) {
        const cesiumViewers =
          containerRef.current.querySelectorAll(".cesium-viewer");
        cesiumViewers.forEach((viewer) => viewer.remove());
        const canvases = containerRef.current.querySelectorAll("canvas");
        canvases.forEach((canvas) => canvas.remove());
        const cesiumWidgets =
          containerRef.current.querySelectorAll(".cesium-widget");
        cesiumWidgets.forEach((widget) => widget.remove());
      }
    }

    // Cleanup function
    return () => {
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy();
        } catch (err) {
          // Ignore cleanup errors
        }
        viewerRef.current = null;
      }
    };
  }, [open]);

  const handleCapture = async () => {
    if (!viewerRef.current) return;

    setCapturing(true);
    try {
      const screenshot = await captureCesiumScreenshot(viewerRef.current);
      if (screenshot) {
        onCapture(screenshot);
        setCapturing(false);
        onClose();
      } else {
        throw new Error("Failed to capture screenshot");
      }
    } catch (err) {
      console.error("Error capturing screenshot:", err);
      setError(
        err instanceof Error ? err.message : "Failed to capture screenshot"
      );
      setCapturing(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            zIndex: 1599,
          },
        },
      }}
      sx={{
        zIndex: 1600,
      }}
      PaperProps={{
        sx: (theme) => ({
          ...((typeof modalPaperStyles === "function"
            ? modalPaperStyles(theme)
            : modalPaperStyles) as Record<string, any>),
          position: "relative",
          zIndex: 1601,
        }),
      }}
    >
      <DialogTitle sx={modalTitleStyles}>
        <Typography sx={modalTitleTextStyles}>
          Retake Photo - {assetName}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={modalCloseButtonStyles}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={(theme) => ({
          padding: "24px",
          backgroundColor: theme.palette.background.default,
        })}
      >
        <Typography
          sx={(theme) => ({
            fontSize: "0.813rem",
            color: theme.palette.text.secondary,
            textAlign: "center",
            mb: 2,
          })}
        >
          Rotate the model to your desired angle, then click &quot;Capture
          Screenshot&quot;
        </Typography>

        <Box
          ref={containerRef}
          sx={(theme) => ({
            width: "100%",
            height: "calc(80vh - 200px)", // Full width, dynamic height based on viewport
            minHeight: "400px",
            borderRadius: "4px",
            overflow: "hidden",
            backgroundColor: theme.palette.background.default,
            border: "1px solid rgba(255, 255, 255, 0.08)",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            // Hide all Cesium credits and attribution
            "& .cesium-viewer-bottom": {
              display: "none !important",
            },
            "& .cesium-credit-text": {
              display: "none !important",
            },
            "& .cesium-credit-logoContainer": {
              display: "none !important",
            },
            "& .cesium-credit-expand-link": {
              display: "none !important",
            },
            "& .cesium-credit-logo": {
              display: "none !important",
            },
            "& .cesium-widget-credits": {
              display: "none !important",
            },
            // Ensure Cesium viewer fills container
            "& .cesium-viewer": {
              width: "100% !important",
              height: "100% !important",
              flex: "1 1 auto",
              minHeight: 0,
            },
            "& .cesium-viewer-cesiumWidgetContainer": {
              width: "100% !important",
              height: "100% !important",
            },
            "& .cesium-widget": {
              width: "100% !important",
              height: "100% !important",
            },
            "& .cesium-widget canvas": {
              width: "100% !important",
              height: "100% !important",
              display: "block",
            },
          })}
        >
          {open && (
            <CesiumMinimalViewer
              key={`cesium-preview-${cesiumAssetId}`}
              containerRef={containerRef}
              cesiumAssetId={cesiumAssetId}
              cesiumApiKey={cesiumApiKey}
              assetType={assetType}
              onViewerReady={handleViewerReady}
              onError={handleError}
            />
          )}

          {loading && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                zIndex: 10,
              }}
            >
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                zIndex: 10,
                p: 2,
              }}
            >
              <Typography
                sx={{
                  color: "error.main",
                  textAlign: "center",
                  fontSize: "0.875rem",
                }}
              >
                {error}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions
        sx={(theme) => ({
          padding: "16px 24px",
          gap: 1,
          backgroundColor: theme.palette.background.paper,
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        })}
      >
        <Button
          onClick={onClose}
          disabled={capturing}
          sx={(theme) => ({
            textTransform: "none",
            fontSize: "0.813rem",
            fontWeight: 500,
            borderRadius: "4px",
            color: theme.palette.text.secondary,
            boxShadow: "none",
            "&:hover": {
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(100, 116, 139, 0.12)"
                  : "rgba(100, 116, 139, 0.08)",
              boxShadow: "none",
            },
          })}
        >
          Cancel
        </Button>
        <Button
          onClick={handleCapture}
          disabled={capturing || loading || !!error}
          variant="contained"
          startIcon={<CameraAlt />}
          sx={(theme) => ({
            textTransform: "none",
            fontSize: "0.813rem",
            fontWeight: 600,
            borderRadius: "4px",
            backgroundColor: theme.palette.primary.main,
            boxShadow: "none",
            "&:hover": {
              backgroundColor: theme.palette.primary.dark,
              boxShadow: "none",
            },
            "&:disabled": {
              backgroundColor: "rgba(100, 116, 139, 0.2)",
              color: "rgba(100, 116, 139, 0.5)",
            },
          })}
        >
          {capturing ? "Capturing..." : "Capture Screenshot"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CesiumPreviewDialog;
