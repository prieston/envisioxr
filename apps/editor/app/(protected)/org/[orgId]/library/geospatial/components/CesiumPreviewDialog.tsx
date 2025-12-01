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
import { CloseIcon, CameraAltIcon } from "@klorad/ui";
import { FitScreen } from "@mui/icons-material";
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
  metadata?: Record<string, unknown> | null; // Model metadata (will extract transform from it)
  onCapture: (screenshot: string) => Promise<void>;
}

const CesiumPreviewDialog: React.FC<CesiumPreviewDialogProps> = ({
  open,
  onClose,
  cesiumAssetId,
  cesiumApiKey,
  assetName,
  assetType,
  metadata,
  onCapture,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const tilesetRef = useRef<any>(null);
  const isCapturingRef = useRef(false); // Track if capture is in progress to prevent cleanup
  const isUploadingRef = useRef(false); // Track if upload is in progress to prevent cleanup
  const [loading, setLoading] = useState(true);
  const [capturing, setCapturing] = useState(false);
  const [uploading, setUploading] = useState(false); // Track upload state after capture
  const [error, setError] = useState<string | null>(null);
  const [locationNotSet, setLocationNotSet] = useState(false);
  const [tilesetReady, setTilesetReady] = useState(false);

  const handleViewerReady = (viewer: any) => {
    viewerRef.current = viewer;
    setLoading(false);
  };

  const handleTilesetReady = (tileset: any) => {
    tilesetRef.current = tileset;
    setTilesetReady(true);
  };

  const handleResetZoom = async () => {
    if (!viewerRef.current || !tilesetRef.current) return;

    try {
      // Dynamically import Cesium
      const Cesium = await import("cesium");

      // Use zoomTo for all cases - this doesn't set a rotation target
      // so left-click drag continues to pan instead of rotating around model
      viewerRef.current.zoomTo(
        tilesetRef.current,
        new Cesium.HeadingPitchRange(0, -0.5, 0)
      );
    } catch (err) {
      console.warn("Error resetting zoom:", err);
      // Fallback: try zoomTo without options
      try {
        if (viewerRef.current && tilesetRef.current) {
          viewerRef.current.zoomTo(tilesetRef.current);
        }
      } catch (fallbackErr) {
        console.error("Error in fallback zoom:", fallbackErr);
      }
    }
  };

  const handleError = (err: Error) => {
    // Don't display errors if viewer is destroyed or being cleaned up
    // These are expected during rapid open/close cycles
    if (
      !viewerRef.current ||
      (viewerRef.current.isDestroyed && viewerRef.current.isDestroyed()) ||
      isCapturingRef.current ||
      isUploadingRef.current
    ) {
      // Silently ignore errors during cleanup or capture
      console.warn(
        "[CesiumPreviewDialog] Error during cleanup/capture (ignored):",
        err.message
      );
      return;
    }

    // Only show errors if they're not related to scene access during cleanup
    const errorMessage = err.message || String(err);
    if (
      errorMessage.includes("Cannot read properties of undefined") &&
      errorMessage.includes("scene")
    ) {
      // This is likely a cleanup race condition - don't show to user
      console.warn(
        "[CesiumPreviewDialog] Scene access error during cleanup (ignored):",
        errorMessage
      );
      return;
    }

    setError(err.message);
    setLoading(false);
  };

  const handleLocationNotSet = () => {
    setLocationNotSet(true);
  };

  const handleClose = () => {
    // Prevent closing while capture or upload is in progress
    if (isCapturingRef.current || isUploadingRef.current) {
      return;
    }
    onClose();
  };

  // Reset state when dialog closes and clean up any existing canvases
  useEffect(() => {
    if (!open) {
      const wasCapturing = isCapturingRef.current;

      // If capture or upload is in progress, cancel it and reset state
      const wasUploading = isUploadingRef.current;
      if (isCapturingRef.current || isUploadingRef.current) {
        isCapturingRef.current = false;
        isUploadingRef.current = false;
        setCapturing(false);
        setUploading(false);
      }

      setLoading(true);
      setError(null);
      setLocationNotSet(false);
      setTilesetReady(false);
      setUploading(false);
      setCapturing(false);

      // Wait longer if capture or upload was in progress to ensure async operations complete
      const delay = wasCapturing || wasUploading ? 1000 : 100;

      // Wait a bit before destroying viewer to ensure any pending operations complete
      const cleanupTimeout = setTimeout(() => {
        if (
          viewerRef.current &&
          !isCapturingRef.current &&
          !isUploadingRef.current
        ) {
          try {
            viewerRef.current.destroy();
          } catch (err) {
            // Ignore cleanup errors
          }
          viewerRef.current = null;
        }
        tilesetRef.current = null;

        // Remove any existing Cesium viewers and elements from container
        if (containerRef.current) {
          const cesiumViewers =
            containerRef.current.querySelectorAll(".cesium-viewer");
          cesiumViewers.forEach((viewer) => {
            if (viewer.parentNode) {
              try {
                viewer.remove();
              } catch (err) {
                // Ignore errors if node was already removed
              }
            }
          });
          const canvases = containerRef.current.querySelectorAll("canvas");
          canvases.forEach((canvas) => {
            if (canvas.parentNode) {
              try {
                canvas.remove();
              } catch (err) {
                // Ignore errors if node was already removed
              }
            }
          });
          const cesiumWidgets =
            containerRef.current.querySelectorAll(".cesium-widget");
          cesiumWidgets.forEach((widget) => {
            if (widget.parentNode) {
              try {
                widget.remove();
              } catch (err) {
                // Ignore errors if node was already removed
              }
            }
          });
        }
      }, delay);

      return () => {
        clearTimeout(cleanupTimeout);
      };
    }

    // Cleanup function
    return () => {
      // Don't cleanup if capture or upload is in progress
      if (isCapturingRef.current || isUploadingRef.current) {
        return;
      }

      if (viewerRef.current) {
        try {
          viewerRef.current.destroy();
        } catch (err) {
          // Ignore cleanup errors
        }
        viewerRef.current = null;
      }
      // Clean up DOM nodes after a small delay to let Cesium finish cleanup
      if (containerRef.current) {
        setTimeout(() => {
          if (containerRef.current) {
            const cesiumViewers =
              containerRef.current.querySelectorAll(".cesium-viewer");
            cesiumViewers.forEach((viewer) => {
              if (viewer.parentNode) {
                try {
                  viewer.remove();
                } catch (err) {
                  // Ignore errors if node was already removed
                }
              }
            });
            const canvases = containerRef.current.querySelectorAll("canvas");
            canvases.forEach((canvas) => {
              if (canvas.parentNode) {
                try {
                  canvas.remove();
                } catch (err) {
                  // Ignore errors if node was already removed
                }
              }
            });
            const cesiumWidgets =
              containerRef.current.querySelectorAll(".cesium-widget");
            cesiumWidgets.forEach((widget) => {
              if (widget.parentNode) {
                try {
                  widget.remove();
                } catch (err) {
                  // Ignore errors if node was already removed
                }
              }
            });
          }
        }, 100);
      }
    };
  }, [open]);

  const handleCapture = async () => {
    // Double-check viewer is still valid before capturing
    if (!viewerRef.current) {
      setError("Viewer not ready. Please wait for the model to load.");
      return;
    }

    // Check if viewer is destroyed
    if (viewerRef.current.isDestroyed && viewerRef.current.isDestroyed()) {
      setError("Viewer has been closed. Please reopen the dialog.");
      return;
    }

    // Check if scene is available
    if (!viewerRef.current.scene) {
      setError("Scene not ready. Please wait for the model to load.");
      return;
    }

    // Set capturing flag to prevent cleanup
    isCapturingRef.current = true;
    setCapturing(true);

    try {
      const screenshot = await captureCesiumScreenshot(viewerRef.current);
      if (screenshot) {
        // Screenshot captured successfully, now upload it
        setCapturing(false);
        isCapturingRef.current = false;
        setUploading(true);
        isUploadingRef.current = true;

        try {
          // Await the upload to complete before closing modal
          await onCapture(screenshot);

          // Upload completed successfully
          setUploading(false);
          isUploadingRef.current = false;

          // Delay closing to ensure React components finish unmounting before viewer is destroyed
          // This prevents useTileset cleanup from accessing viewer.scene after _cesiumWidget is undefined
          setTimeout(() => {
            onClose();
          }, 100); // Small delay to let React cleanup complete
        } catch (uploadErr) {
          // Upload failed, but screenshot was captured
          console.error("Error uploading screenshot:", uploadErr);
          setError(
            uploadErr instanceof Error
              ? uploadErr.message
              : "Failed to upload screenshot"
          );
          setUploading(false);
          isUploadingRef.current = false;
          // Don't close modal on upload error - let user retry
        }
      } else {
        throw new Error("Failed to capture screenshot");
      }
    } catch (err) {
      console.error("Error capturing screenshot:", err);
      setError(
        err instanceof Error ? err.message : "Failed to capture screenshot"
      );
      setCapturing(false);
      setUploading(false);
      isCapturingRef.current = false;
      isUploadingRef.current = false;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            zIndex: 1599,
          },
          onClick:
            uploading || capturing ? (e) => e.stopPropagation() : undefined,
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
        <IconButton
          onClick={handleClose}
          size="small"
          sx={modalCloseButtonStyles}
          disabled={capturing || uploading}
        >
          <CloseIcon />
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
              metadata={metadata}
              onViewerReady={handleViewerReady}
              onTilesetReady={handleTilesetReady}
              onError={handleError}
              onLocationNotSet={handleLocationNotSet}
              enableLocationEditing={false}
              enableAtmosphere={true}
            />
          )}

          {/* Reset Zoom Button */}
          {!loading && !error && tilesetReady && (
            <IconButton
              onClick={handleResetZoom}
              sx={() => ({
                position: "absolute",
                top: 16,
                right: 16,
                zIndex: 20,
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                color: "white",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.9)",
                },
                width: 40,
                height: 40,
              })}
              size="small"
              title="Reset Zoom"
            >
              <FitScreen sx={{ fontSize: "1.25rem" }} />
            </IconButton>
          )}

          {locationNotSet && (
            <Box
              sx={{
                position: "absolute",
                top: 16,
                left: 16,
                right: 16,
                zIndex: 20,
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                borderRadius: "4px",
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Typography
                sx={{
                  color: "warning.main",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                }}
              >
                ℹ️ Tileset location has not been set
              </Typography>
            </Box>
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
          onClick={handleClose}
          disabled={capturing || uploading}
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
          disabled={
            capturing ||
            uploading ||
            loading ||
            !!error ||
            !viewerRef.current ||
            !tilesetReady
          }
          variant="contained"
          startIcon={
            uploading ? <CircularProgress size={16} /> : <CameraAltIcon />
          }
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
          {capturing
            ? "Capturing..."
            : uploading
              ? "Uploading..."
              : "Capture Screenshot"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CesiumPreviewDialog;
