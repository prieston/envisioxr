/* eslint-disable no-console */
"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
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
  TextField,
  Grid,
} from "@mui/material";
import { CloseIcon, LocationSearch } from "@klorad/ui";
import {
  modalPaperStyles,
  modalTitleStyles,
  modalTitleTextStyles,
  modalCloseButtonStyles,
} from "@klorad/ui";
import { CesiumMinimalViewer } from "@klorad/engine-cesium";
import { matrix4ToArray, arrayToMatrix4 } from "@klorad/engine-cesium";

interface AdjustTilesetLocationDialogProps {
  open: boolean;
  onClose: () => void;
  cesiumAssetId: string;
  cesiumApiKey: string;
  assetName: string;
  assetType?: string;
  initialTransform?: number[]; // Existing transform matrix (16 numbers)
  onSave: (
    transform: number[],
    longitude: number,
    latitude: number,
    height: number
  ) => Promise<void>;
}

const AdjustTilesetLocationDialog: React.FC<
  AdjustTilesetLocationDialogProps
> = ({
  open,
  onClose,
  cesiumAssetId,
  cesiumApiKey,
  assetName,
  assetType,
  initialTransform,
  onSave,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const cesiumRef = useRef<any>(null);
  const tilesetRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTransform, setCurrentTransform] = useState<
    number[] | undefined
  >(initialTransform);
  const [currentLocation, setCurrentLocation] = useState<{
    longitude: number;
    latitude: number;
    height: number;
  } | null>(null);
  const [pendingLocation, setPendingLocation] = useState<{
    longitude: number;
    latitude: number;
    height: number;
  } | null>(null);
  const [clickModeEnabled, setClickModeEnabled] = useState(false); // Separate state for click-to-position mode
  const [showPositionConfirm, setShowPositionConfirm] = useState(false); // Only for showing the confirmation dialog

  // Manual input states
  const [manualLongitude, setManualLongitude] = useState<string>("");
  const [manualLatitude, setManualLatitude] = useState<string>("");
  const [manualHeight, setManualHeight] = useState<string>("");
  const [manualHeading, setManualHeading] = useState<string>("0");
  const [manualPitch, setManualPitch] = useState<string>("0");
  const [manualRoll, setManualRoll] = useState<string>("0");

  // Store the last confirmed transform to restore on cancel
  const [lastConfirmedTransform, setLastConfirmedTransform] = useState<
    number[] | undefined
  >(initialTransform);

  const handleViewerReady = useCallback((viewer: any) => {
    viewerRef.current = viewer;
    setLoading(false);
  }, []);

  const handleTilesetReady = useCallback(
    async (tileset: any) => {
      tilesetRef.current = tileset;

      // Always load Cesium for location editing
      try {
        const Cesium = await import("cesium");
        cesiumRef.current = Cesium;

        // Extract location from initial transform if it exists
        if (initialTransform && initialTransform.length === 16) {
          const translation = new Cesium.Cartesian3(
            initialTransform[12],
            initialTransform[13],
            initialTransform[14]
          );
          const cartographic = Cesium.Cartographic.fromCartesian(translation);
          const location = {
            longitude: Cesium.Math.toDegrees(cartographic.longitude),
            latitude: Cesium.Math.toDegrees(cartographic.latitude),
            height: cartographic.height,
          };
          setCurrentLocation(location);

          // Initialize manual input fields
          setManualLongitude(location.longitude.toFixed(6));
          setManualLatitude(location.latitude.toFixed(6));
          setManualHeight(location.height.toFixed(2));
        }
      } catch (err) {
        console.error(
          "Failed to load Cesium or extract location from transform:",
          err
        );
      }
    },
    [initialTransform]
  );

  const handleError = useCallback((err: Error) => {
    setError(err.message);
    setLoading(false);
  }, []);

  const handleLocationClick = useCallback(
    async (
      longitude: number,
      latitude: number,
      height: number,
      matrix: number[] // The actual matrix array that was ALREADY applied in CesiumMinimalViewer
    ) => {
      // Only process clicks if click mode is enabled
      if (!clickModeEnabled) {        return;
      }

      // Ensure Cesium is loaded
      if (!cesiumRef.current) {
        try {
          const Cesium = await import("cesium");
          cesiumRef.current = Cesium;
        } catch (err) {
          console.error(
            "[AdjustTilesetLocationDialog] Failed to load Cesium:",
            err
          );
          return;
        }
      }

      if (!tilesetRef.current || !cesiumRef.current) {
        console.warn(
          "[AdjustTilesetLocationDialog] Missing tileset or cesium ref"
        );
        return;
      }
      // Transform is ALREADY applied by CesiumMinimalViewer
      // We just need to store the matrix and show confirmation

      // Store the exact matrix array that was applied and location
      setPendingLocation({ longitude, latitude, height });
      setCurrentTransform(matrix); // Store the exact matrix that was applied
      setCurrentLocation({ longitude, latitude, height });

      // Show confirmation dialog
      setShowPositionConfirm(true);
    },
    [clickModeEnabled]
  );

  const handleConfirmPosition = useCallback(async () => {
    // Transform is already applied from handleLocationClick
    // Confirm it and disable click mode
    if (!currentTransform || !pendingLocation) return;

    // Update the location state (transform is already applied and stored)
    setCurrentLocation(pendingLocation);

    // Store as the last confirmed transform
    setLastConfirmedTransform(currentTransform);

    // Update manual inputs
    setManualLongitude(pendingLocation.longitude.toFixed(6));
    setManualLatitude(pendingLocation.latitude.toFixed(6));
    setManualHeight(pendingLocation.height.toFixed(2));

    // Hide confirmation dialog AND disable click mode
    setShowPositionConfirm(false);
    setPendingLocation(null);
    setClickModeEnabled(false); // Disable click mode after confirmation  }, [currentTransform, pendingLocation]);

  const handleCancelPosition = useCallback(async () => {
    // User clicked Cancel on the confirmation dialog - restore previous transform
    if (
      lastConfirmedTransform &&
      tilesetRef.current &&
      cesiumRef.current &&
      viewerRef.current
    ) {
      const Cesium = cesiumRef.current;
      const matrix = arrayToMatrix4(Cesium, lastConfirmedTransform);
      tilesetRef.current.modelMatrix = matrix;

      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.scene.requestRender();
        setTimeout(() => {
          if (viewerRef.current && !viewerRef.current.isDestroyed()) {
            viewerRef.current.scene.requestRender();
          }
        }, 50);
      }

      setCurrentTransform(lastConfirmedTransform);

      // Extract location from last confirmed transform
      const translation = new Cesium.Cartesian3(
        lastConfirmedTransform[12],
        lastConfirmedTransform[13],
        lastConfirmedTransform[14]
      );
      const cartographic = Cesium.Cartographic.fromCartesian(translation);
      const location = {
        longitude: Cesium.Math.toDegrees(cartographic.longitude),
        latitude: Cesium.Math.toDegrees(cartographic.latitude),
        height: cartographic.height,
      };
      setCurrentLocation(location);
    }

    setShowPositionConfirm(false);
    setPendingLocation(null);
  }, [lastConfirmedTransform]);

  const handleLocationSelect = useCallback(
    async (assetId: string, latitude: number, longitude: number) => {
      if (!viewerRef.current) return;

      try {
        const Cesium = await import("cesium");

        // Fly camera to selected location
        viewerRef.current.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(
            longitude,
            latitude,
            10000
          ),
          duration: 2.0,
        });
      } catch (err) {
        console.error("Error flying to location:", err);
        setError(
          err instanceof Error ? err.message : "Failed to navigate to location"
        );
      }
    },
    []
  );

  const handleApplyManualChanges = useCallback(async () => {
    if (!cesiumRef.current || !tilesetRef.current || !viewerRef.current) {
      setError("Cesium viewer not ready");
      return;
    }

    try {
      const Cesium = cesiumRef.current;

      const longitude = parseFloat(manualLongitude);
      const latitude = parseFloat(manualLatitude);
      const height = parseFloat(manualHeight);
      const heading = parseFloat(manualHeading);
      const pitch = parseFloat(manualPitch);
      const roll = parseFloat(manualRoll);

      if (isNaN(longitude) || isNaN(latitude) || isNaN(height)) {
        setError("Invalid position values");
        return;
      }
      // Create position
      const position = Cesium.Cartesian3.fromDegrees(
        longitude,
        latitude,
        height
      );

      // Create rotation matrix from HPR
      const headingRadians = Cesium.Math.toRadians(heading);
      const pitchRadians = Cesium.Math.toRadians(pitch);
      const rollRadians = Cesium.Math.toRadians(roll);
      const hpr = new Cesium.HeadingPitchRoll(
        headingRadians,
        pitchRadians,
        rollRadians
      );

      // Create transform matrix with rotation
      const transformMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(
        position,
        hpr,
        Cesium.Ellipsoid.WGS84
      );

      // Apply to tileset
      tilesetRef.current.modelMatrix = transformMatrix;

      // Request renders with safety checks
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.scene.requestRender();
        setTimeout(() => {
          if (viewerRef.current && !viewerRef.current.isDestroyed()) {
            viewerRef.current.scene.requestRender();
          }
        }, 50);
        setTimeout(() => {
          if (viewerRef.current && !viewerRef.current.isDestroyed()) {
            viewerRef.current.scene.requestRender();
          }
        }, 100);
      }

      // Convert matrix to array and store
      const matrixArray = matrix4ToArray(transformMatrix);
      setCurrentTransform(matrixArray);
      setCurrentLocation({ longitude, latitude, height });    } catch (err) {
      console.error(
        "[AdjustTilesetLocationDialog] Failed to apply manual changes:",
        err
      );
      setError(err instanceof Error ? err.message : "Failed to apply changes");
    }
  }, [
    manualLongitude,
    manualLatitude,
    manualHeight,
    manualHeading,
    manualPitch,
    manualRoll,
  ]);

  const handleSave = useCallback(async () => {
    if (!currentTransform || !currentLocation) {
      setError("Please click on the map to set a location first");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSave(
        currentTransform, // The exact matrix array that was applied
        currentLocation.longitude,
        currentLocation.latitude,
        currentLocation.height
      );      onClose();
    } catch (err) {
      console.error("[AdjustTilesetLocationDialog] ❌ Failed to save:", err);
      setError(err instanceof Error ? err.message : "Failed to save location");
    } finally {
      setSaving(false);
    }
  }, [currentTransform, currentLocation, onSave, onClose]);

  // Update cursor when click mode is enabled/disabled
  useEffect(() => {
    if (!viewerRef.current || !open) return;

    const canvas = viewerRef.current.scene?.canvas;
    if (!canvas) return;

    // Crosshair when click mode is enabled, normal cursor otherwise
    if (clickModeEnabled) {
      canvas.style.cursor = "crosshair";
    } else {
      canvas.style.cursor = "auto";
    }

    return () => {
      if (canvas) {
        canvas.style.cursor = "auto";
      }
    };
  }, [clickModeEnabled, open]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setLoading(true);
      setError(null);
      setCurrentTransform(initialTransform);
      setCurrentLocation(null);
      setPendingLocation(null);
      setShowPositionConfirm(false);
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy();
        } catch (err) {
          // Ignore cleanup errors
        }
        viewerRef.current = null;
      }
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
    }
  }, [open, initialTransform]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
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
          Adjust Tileset Location - {assetName}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={modalCloseButtonStyles}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={(theme) => ({
          padding: "24px",
          backgroundColor: theme.palette.background.default,
          display: "flex",
          gap: 3,
          height: "calc(80vh - 200px)",
          minHeight: "600px",
        })}
      >
        {/* Left Column - Controls */}
        <Box
          sx={{
            width: "380px",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            overflowY: "auto",
            pr: 2,
          }}
        >
          <Typography
            sx={(theme) => ({
              fontSize: "0.813rem",
              color: theme.palette.text.secondary,
            })}
          >
            Click on the map to position the tileset. You can search for a
            location below.
          </Typography>

          {/* Click Position Button */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              variant={clickModeEnabled ? "contained" : "outlined"}
              onClick={async () => {
                if (clickModeEnabled) {
                  // Cancel click mode - restore previous confirmed transform
                  if (
                    lastConfirmedTransform &&
                    tilesetRef.current &&
                    cesiumRef.current &&
                    viewerRef.current
                  ) {
                    const Cesium = cesiumRef.current;
                    const matrix = arrayToMatrix4(
                      Cesium,
                      lastConfirmedTransform
                    );
                    tilesetRef.current.modelMatrix = matrix;

                    if (viewerRef.current && !viewerRef.current.isDestroyed()) {
                      viewerRef.current.scene.requestRender();
                      setTimeout(() => {
                        if (
                          viewerRef.current &&
                          !viewerRef.current.isDestroyed()
                        ) {
                          viewerRef.current.scene.requestRender();
                        }
                      }, 50);
                    }

                    setCurrentTransform(lastConfirmedTransform);

                    // Extract location from last confirmed transform
                    const translation = new Cesium.Cartesian3(
                      lastConfirmedTransform[12],
                      lastConfirmedTransform[13],
                      lastConfirmedTransform[14]
                    );
                    const cartographic =
                      Cesium.Cartographic.fromCartesian(translation);
                    const location = {
                      longitude: Cesium.Math.toDegrees(cartographic.longitude),
                      latitude: Cesium.Math.toDegrees(cartographic.latitude),
                      height: cartographic.height,
                    };
                    setCurrentLocation(location);
                  }

                  setClickModeEnabled(false);
                  setShowPositionConfirm(false);
                  setPendingLocation(null);
                } else {
                  // Enable click-to-position mode
                  setClickModeEnabled(true);
                }
              }}
              sx={{
                textTransform: "none",
                fontSize: "0.813rem",
                fontWeight: 500,
              }}
            >
              {clickModeEnabled ? "Cancel Click" : "Click Position"}
            </Button>
            {clickModeEnabled && !showPositionConfirm && (
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  color: "primary.main",
                  fontStyle: "italic",
                }}
              >
                Click on the map to set position
              </Typography>
            )}
          </Box>

          {/* Location Search */}
          <Box>
            <LocationSearch
              onAssetSelect={handleLocationSelect}
              boxPadding={1}
            />
          </Box>

          {/* Manual Position and Rotation Controls */}
          <Box
            sx={{
              p: 2,
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              borderRadius: "4px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <Typography
              sx={{
                fontSize: "0.813rem",
                fontWeight: 600,
                mb: 1.5,
              }}
            >
              Manual Adjustments
            </Typography>

            {/* Position Controls */}
            <Typography
              sx={{
                fontSize: "0.75rem",
                fontWeight: 500,
                mb: 1,
                color: "text.secondary",
              }}
            >
              Position
            </Typography>
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Longitude"
                  type="number"
                  value={manualLongitude}
                  onChange={(e) => setManualLongitude(e.target.value)}
                  size="small"
                  inputProps={{ step: "0.000001" }}
                  sx={{
                    "& .MuiInputBase-input": {
                      fontSize: "0.813rem",
                    },
                    "& .MuiInputLabel-root": {
                      fontSize: "0.75rem",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Latitude"
                  type="number"
                  value={manualLatitude}
                  onChange={(e) => setManualLatitude(e.target.value)}
                  size="small"
                  inputProps={{ step: "0.000001" }}
                  sx={{
                    "& .MuiInputBase-input": {
                      fontSize: "0.813rem",
                    },
                    "& .MuiInputLabel-root": {
                      fontSize: "0.75rem",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Height (m)"
                  type="number"
                  value={manualHeight}
                  onChange={(e) => setManualHeight(e.target.value)}
                  size="small"
                  inputProps={{ step: "0.01" }}
                  sx={{
                    "& .MuiInputBase-input": {
                      fontSize: "0.813rem",
                    },
                    "& .MuiInputLabel-root": {
                      fontSize: "0.75rem",
                    },
                  }}
                />
              </Grid>
            </Grid>

            {/* Rotation Controls */}
            <Typography
              sx={{
                fontSize: "0.75rem",
                fontWeight: 500,
                mb: 1,
                color: "text.secondary",
              }}
            >
              Rotation (degrees)
            </Typography>
            <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Heading"
                  type="number"
                  value={manualHeading}
                  onChange={(e) => setManualHeading(e.target.value)}
                  size="small"
                  inputProps={{ step: "1" }}
                  sx={{
                    "& .MuiInputBase-input": {
                      fontSize: "0.813rem",
                    },
                    "& .MuiInputLabel-root": {
                      fontSize: "0.75rem",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Pitch"
                  type="number"
                  value={manualPitch}
                  onChange={(e) => setManualPitch(e.target.value)}
                  size="small"
                  inputProps={{ step: "1" }}
                  sx={{
                    "& .MuiInputBase-input": {
                      fontSize: "0.813rem",
                    },
                    "& .MuiInputLabel-root": {
                      fontSize: "0.75rem",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Roll"
                  type="number"
                  value={manualRoll}
                  onChange={(e) => setManualRoll(e.target.value)}
                  size="small"
                  inputProps={{ step: "1" }}
                  sx={{
                    "& .MuiInputBase-input": {
                      fontSize: "0.813rem",
                    },
                    "& .MuiInputLabel-root": {
                      fontSize: "0.75rem",
                    },
                  }}
                />
              </Grid>
            </Grid>

            <Button
              variant="outlined"
              size="small"
              fullWidth
              onClick={handleApplyManualChanges}
              sx={{
                textTransform: "none",
                fontSize: "0.75rem",
                fontWeight: 500,
              }}
            >
              Apply Changes
            </Button>
          </Box>

          {/* Current Location Display */}
          {currentLocation && (
            <Box
              sx={{
                p: 1.5,
                backgroundColor: "rgba(107, 156, 216, 0.1)",
                borderRadius: "4px",
                border: "1px solid rgba(107, 156, 216, 0.2)",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  mb: 0.5,
                }}
              >
                Current Location:
              </Typography>
              <Typography sx={{ fontSize: "0.75rem" }}>
                Longitude: {currentLocation.longitude.toFixed(6)}, Latitude:{" "}
                {currentLocation.latitude.toFixed(6)}, Height:{" "}
                {currentLocation.height.toFixed(2)}m
              </Typography>
            </Box>
          )}
        </Box>

        {/* Right Column - Cesium Viewer */}
        <Box
          sx={{
            flex: 1,
            position: "relative",
            minWidth: 0,
          }}
        >
          <Box
            ref={containerRef}
            sx={(theme) => ({
              width: "100%",
              height: "100%",
              borderRadius: "4px",
              overflow: "hidden",
              backgroundColor: theme.palette.background.default,
              border: "1px solid rgba(255, 255, 255, 0.08)",
              position: "relative",
              display: "flex",
              flexDirection: "column",
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
                key={`location-editor-${cesiumAssetId}`}
                containerRef={containerRef}
                cesiumAssetId={cesiumAssetId}
                cesiumApiKey={cesiumApiKey}
                assetType={assetType}
                onViewerReady={handleViewerReady}
                onError={handleError}
                onTilesetReady={handleTilesetReady}
                initialTransform={currentTransform}
                enableLocationEditing={true}
                enableClickToPosition={clickModeEnabled}
                onLocationClick={handleLocationClick}
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
                  top: 16,
                  left: 16,
                  right: 16,
                  zIndex: 20,
                  backgroundColor: "rgba(239, 68, 68, 0.9)",
                  borderRadius: "4px",
                  padding: "8px 12px",
                }}
              >
                <Typography
                  sx={{
                    color: "white",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                  }}
                >
                  {error}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Position Confirmation Info Box */}
          {showPositionConfirm && pendingLocation && (
            <Box
              sx={{
                position: "absolute",
                top: 16,
                left: 16,
                right: 16,
                zIndex: 25,
                backgroundColor: "rgba(107, 156, 216, 0.95)",
                borderRadius: "4px",
                padding: "12px 16px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
              }}
            >
              <Typography
                sx={{
                  color: "white",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  mb: 1,
                }}
              >
                Confirm Position
              </Typography>
              <Typography
                sx={{
                  color: "white",
                  fontSize: "0.75rem",
                  mb: 2,
                  fontFamily: "monospace",
                }}
              >
                Longitude: {pendingLocation.longitude.toFixed(6)}
                <br />
                Latitude: {pendingLocation.latitude.toFixed(6)}
                <br />
                Height: {pendingLocation.height.toFixed(2)}m
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleConfirmPosition}
                  sx={{
                    textTransform: "none",
                    fontSize: "0.75rem",
                    backgroundColor: "white",
                    color: "primary.main",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                    },
                  }}
                >
                  Confirm
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleCancelPosition}
                  sx={{
                    textTransform: "none",
                    fontSize: "0.75rem",
                    borderColor: "white",
                    color: "white",
                    "&:hover": {
                      borderColor: "white",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                    },
                  }}
                >
                  Cancel
                </Button>
              </Box>
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
          disabled={saving}
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
          onClick={handleSave}
          disabled={saving || loading || !currentTransform}
          variant="contained"
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
          {saving ? "Saving..." : "Save Location"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdjustTilesetLocationDialog;
