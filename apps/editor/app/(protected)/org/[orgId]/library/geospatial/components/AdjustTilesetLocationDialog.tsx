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
} from "@mui/material";
import { CloseIcon, LocationSearch } from "@klorad/ui";
import {
  modalPaperStyles,
  modalTitleStyles,
  modalTitleTextStyles,
  modalCloseButtonStyles,
} from "@klorad/ui";
import {
  extractLocationFromTransform,
  extractHPRFromTransform,
  restoreTransform,
} from "./AdjustTilesetLocationDialog/utils/transform-utils";
import { cleanupCesiumViewer } from "./AdjustTilesetLocationDialog/utils/viewer-cleanup";
import { useTilesetLocationState } from "./AdjustTilesetLocationDialog/hooks/useTilesetLocationState";
import { useGeoreferencingDetection } from "./AdjustTilesetLocationDialog/hooks/useGeoreferencingDetection";
import { useManualInputs } from "./AdjustTilesetLocationDialog/hooks/useManualInputs";
import { useClickMode } from "./AdjustTilesetLocationDialog/hooks/useClickMode";
import { useDialogLifecycle } from "./AdjustTilesetLocationDialog/hooks/useDialogLifecycle";
import { useCursorStyle } from "./AdjustTilesetLocationDialog/hooks/useCursorStyle";
import { GeoreferencingInfoAlert } from "./AdjustTilesetLocationDialog/components/GeoreferencingInfoAlert";
import { ClickPositionButton } from "./AdjustTilesetLocationDialog/components/ClickPositionButton";
import { ManualAdjustmentsForm } from "./AdjustTilesetLocationDialog/components/ManualAdjustmentsForm";
import { CurrentLocationDisplay } from "./AdjustTilesetLocationDialog/components/CurrentLocationDisplay";
import { CesiumViewerContainer } from "./AdjustTilesetLocationDialog/components/CesiumViewerContainer";
import { PositionConfirmationDialog } from "./AdjustTilesetLocationDialog/components/PositionConfirmationDialog";

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

  // Location state management
  const locationState = useTilesetLocationState(initialTransform);

  // Georeferencing detection (needs to be created before manual inputs)
  const georeferencingDetection = useGeoreferencingDetection({
    initialTransform,
    onLocationDetected: (location) => {
      locationState.setCurrentLocation(location);
    },
    onHPRDetected: () => {
      // HPR will be set by manual inputs when location is detected
    },
  });

  // Manual inputs
  const manualInputs = useManualInputs({
    tilesetRef,
    cesiumRef,
    viewerRef,
    onTransformApplied: (transform, location) => {
      locationState.setCurrentTransform(transform);
      locationState.setCurrentLocation(location);
      locationState.setLastConfirmedTransform(transform);
      georeferencingDetection.setIsGeoreferencedByDefault(false);
    },
    onError: setError,
  });

  // Initialize manual inputs when location is detected
  useEffect(() => {
    if (
      locationState.currentLocation &&
      initialTransform &&
      initialTransform.length === 16
    ) {
      const initializeManualInputs = async () => {
        try {
          const Cesium = await import("cesium");
          const hpr = extractHPRFromTransform(Cesium, initialTransform);
          manualInputs.setValues(locationState.currentLocation!, hpr);
        } catch (err) {
          console.error("Failed to initialize manual inputs:", err);
        }
      };
      initializeManualInputs();
    } else if (locationState.currentLocation) {
      manualInputs.setValues(locationState.currentLocation);
    }
  }, [locationState.currentLocation, initialTransform, manualInputs]);

  // Click mode
  const clickMode = useClickMode({
    tilesetRef,
    cesiumRef,
    viewerRef,
    lastConfirmedTransform: locationState.lastConfirmedTransform,
    onLocationClick: (location, transform) => {
      locationState.setPendingLocation(location);
      locationState.setCurrentTransform(transform);
      locationState.setCurrentLocation(location);
    },
    onTransformRestored: (transform, location) => {
      locationState.setCurrentTransform(transform);
      locationState.setCurrentLocation(location);
    },
  });

  // Dialog lifecycle - use useCallback to stabilize the onReset callback
  const handleDialogReset = useCallback(() => {
    locationState.reset(initialTransform);
    georeferencingDetection.reset();
    setLoading(true);
    setError(null);
  }, [initialTransform, locationState, georeferencingDetection]);

  const { stableInitialTransformRef } = useDialogLifecycle({
    open,
    initialTransform,
    onReset: handleDialogReset,
  });

  // Cursor style
  useCursorStyle(viewerRef, clickMode.clickModeEnabled, open);

  // Viewer ready handler
  const handleViewerReady = useCallback((viewer: any) => {
    viewerRef.current = viewer;
    setLoading(false);
  }, []);

  // Tileset ready handler - combines georeferencing detection with manual inputs initialization
  const handleTilesetReady = useCallback(
    async (tileset: any) => {
      tilesetRef.current = tileset;

      try {
        const Cesium = await import("cesium");
        cesiumRef.current = Cesium;

        // Handle georeferencing detection (this will also initialize manual inputs if needed)
        await georeferencingDetection.handleTilesetReady(tileset);
      } catch (err) {
        console.error(
          "[AdjustTilesetLocationDialog] Failed to handle tileset ready:",
          err
        );
      }
    },
    [georeferencingDetection]
  );

  // Error handler
  const handleError = useCallback((err: Error) => {
    setError(err.message);
    setLoading(false);
  }, []);

  // Reset zoom handler
  const handleResetZoom = useCallback(async () => {
    if (!viewerRef.current || !tilesetRef.current) return;

    try {
      const Cesium = await import("cesium");
      viewerRef.current.zoomTo(
        tilesetRef.current,
        new Cesium.HeadingPitchRange(0, -0.5, 0)
      );
    } catch (err) {
      console.warn("[AdjustTilesetLocationDialog] Error resetting zoom:", err);
      try {
        if (viewerRef.current && tilesetRef.current) {
          viewerRef.current.zoomTo(tilesetRef.current);
        }
      } catch (fallbackErr) {
        console.error(
          "[AdjustTilesetLocationDialog] Error in fallback zoom:",
          fallbackErr
        );
      }
    }
  }, []);

  // Location select handler (for LocationSearch)
  const handleLocationSelect = useCallback(
    async (assetId: string, latitude: number, longitude: number) => {
      if (!viewerRef.current) return;

      try {
        const Cesium = await import("cesium");
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

  // Confirm position handler
  const handleConfirmPosition = useCallback(() => {
    if (!locationState.currentTransform || !locationState.pendingLocation)
      return;

    georeferencingDetection.setIsGeoreferencedByDefault(false);
    locationState.setCurrentLocation(locationState.pendingLocation);
    locationState.setLastConfirmedTransform(locationState.currentTransform);
    manualInputs.setValues(locationState.pendingLocation);
    clickMode.confirmPosition();
    locationState.setPendingLocation(null);
  }, [locationState, georeferencingDetection, manualInputs, clickMode]);

  // Cancel position handler
  const handleCancelPosition = useCallback(async () => {
    if (
      locationState.lastConfirmedTransform &&
      tilesetRef.current &&
      cesiumRef.current &&
      viewerRef.current
    ) {
      const Cesium = cesiumRef.current;
      restoreTransform(
        tilesetRef.current,
        Cesium,
        locationState.lastConfirmedTransform,
        viewerRef.current
      );

      const location = extractLocationFromTransform(
        Cesium,
        locationState.lastConfirmedTransform
      );
      locationState.setCurrentTransform(locationState.lastConfirmedTransform);
      locationState.setCurrentLocation(location);
    }

    clickMode.cancelPosition();
    locationState.setPendingLocation(null);
  }, [locationState, tilesetRef, cesiumRef, viewerRef, clickMode]);

  // Save handler
  const handleSave = useCallback(async () => {
    if (!locationState.currentTransform || !locationState.currentLocation) {
      setError("Please click on the map to set a location first");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSave(
        locationState.currentTransform,
        locationState.currentLocation.longitude,
        locationState.currentLocation.latitude,
        locationState.currentLocation.height
      );
      onClose();
    } catch (err) {
      console.error("[AdjustTilesetLocationDialog] ❌ Failed to save:", err);
      setError(err instanceof Error ? err.message : "Failed to save location");
    } finally {
      setSaving(false);
    }
  }, [locationState, onSave, onClose]);

  // Cleanup on dialog close
  useEffect(() => {
    if (!open) {
      cleanupCesiumViewer(containerRef, viewerRef);
    }
  }, [open]);

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
          {georeferencingDetection.isGeoreferencedByDefault ? (
            <GeoreferencingInfoAlert />
          ) : (
            <Typography
              sx={(theme) => ({
                fontSize: "0.813rem",
                color: theme.palette.text.secondary,
              })}
            >
              Click on the map to position the tileset. You can search for a
              location below.
            </Typography>
          )}

          <ClickPositionButton
            clickModeEnabled={clickMode.clickModeEnabled}
            disabled={georeferencingDetection.isGeoreferencedByDefault}
            onToggle={clickMode.toggleClickMode}
          />

          {!georeferencingDetection.isGeoreferencedByDefault && (
            <Box>
              <LocationSearch
                onAssetSelect={handleLocationSelect}
                boxPadding={1}
              />
            </Box>
          )}

          <ManualAdjustmentsForm
            longitude={manualInputs.manualLongitude}
            latitude={manualInputs.manualLatitude}
            height={manualInputs.manualHeight}
            heading={manualInputs.manualHeading}
            pitch={manualInputs.manualPitch}
            roll={manualInputs.manualRoll}
            onLongitudeChange={manualInputs.setManualLongitude}
            onLatitudeChange={manualInputs.setManualLatitude}
            onHeightChange={manualInputs.setManualHeight}
            onHeadingChange={manualInputs.setManualHeading}
            onPitchChange={manualInputs.setManualPitch}
            onRollChange={manualInputs.setManualRoll}
            onApply={manualInputs.applyManualChanges}
            disabled={georeferencingDetection.isGeoreferencedByDefault}
          />

          {locationState.currentLocation && (
            <CurrentLocationDisplay location={locationState.currentLocation} />
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
          <CesiumViewerContainer
            containerRef={containerRef}
            open={open}
            cesiumAssetId={cesiumAssetId}
            cesiumApiKey={cesiumApiKey}
            assetType={assetType}
            initialTransform={stableInitialTransformRef.current}
            loading={loading}
            error={error}
            viewerRef={viewerRef}
            tilesetRef={tilesetRef}
            onViewerReady={handleViewerReady}
            onError={handleError}
            onTilesetReady={handleTilesetReady}
            clickModeEnabled={clickMode.clickModeEnabled}
            onLocationClick={clickMode.handleLocationClick}
            onResetZoom={handleResetZoom}
          />

          {clickMode.showPositionConfirm && locationState.pendingLocation && (
            <PositionConfirmationDialog
              location={locationState.pendingLocation}
              onConfirm={handleConfirmPosition}
              onCancel={handleCancelPosition}
            />
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
          disabled={
            saving ||
            loading ||
            !locationState.currentTransform ||
            georeferencingDetection.isGeoreferencedByDefault
          }
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
