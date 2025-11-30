"use client";

import { Box, CircularProgress, IconButton, Typography } from "@mui/material";
import { FitScreen } from "@mui/icons-material";
import { CesiumMinimalViewer } from "@klorad/engine-cesium";
import React from "react";

interface CesiumViewerContainerProps {
  containerRef: React.RefObject<HTMLDivElement>;
  open: boolean;
  cesiumAssetId: string;
  cesiumApiKey: string;
  assetType?: string;
  initialTransform?: number[];
  loading: boolean;
  error: string | null;
  viewerRef: React.MutableRefObject<any>;
  tilesetRef: React.MutableRefObject<any>;
  onViewerReady: (viewer: any) => void;
  onError: (err: Error) => void;
  onTilesetReady: (tileset: any) => void;
  clickModeEnabled: boolean;
  onLocationClick: (
    longitude: number,
    latitude: number,
    height: number,
    matrix: number[]
  ) => void;
  onResetZoom: () => void;
}

export function CesiumViewerContainer({
  containerRef,
  open,
  cesiumAssetId,
  cesiumApiKey,
  assetType,
  initialTransform,
  loading,
  error,
  viewerRef,
  tilesetRef,
  onViewerReady,
  onError,
  onTilesetReady,
  clickModeEnabled,
  onLocationClick,
  onResetZoom,
}: CesiumViewerContainerProps) {
  return (
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
          onViewerReady={onViewerReady}
          onError={onError}
          onTilesetReady={onTilesetReady}
          initialTransform={initialTransform}
          metadata={undefined}
          enableLocationEditing={true}
          enableClickToPosition={clickModeEnabled}
          onLocationClick={onLocationClick}
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

      {/* Reset Zoom Button */}
      {!loading && !error && viewerRef.current && tilesetRef.current && (
        <IconButton
          onClick={onResetZoom}
          sx={{
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
          }}
          size="small"
          title="Reset Zoom"
        >
          <FitScreen sx={{ fontSize: "1.25rem" }} />
        </IconButton>
      )}
    </Box>
  );
}

