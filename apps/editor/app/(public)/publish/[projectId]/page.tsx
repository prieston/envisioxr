"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Typography, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useSceneStore, useWorldStore } from "@envisio/core";
import { LoadingScreen } from "@envisio/ui";
import useProject from "@/app/hooks/useProject";
// eslint-disable-next-line import/extensions
import MobileLayout from "@/app/components/PublishPage/MobileLayout";
// eslint-disable-next-line import/extensions
import DesktopLayout from "@/app/components/PublishPage/DesktopLayout";

const PublishedScenePage = () => {
  const { projectId } = useParams();
  const { project: fetchedProject, loadingProject } = useProject(projectId as string);
  const [project, setProject] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const setActiveWorld = useWorldStore((s) => s.setActiveWorld);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Destructure necessary state and actions from the store using selectors
  const previewMode = useSceneStore((state) => state.previewMode);
  const setPreviewMode = useSceneStore((state) => state.setPreviewMode);
  const setObservationPoints = useSceneStore(
    (state) => state.setObservationPoints
  );
  const observationPoints = useSceneStore((state) => state.observationPoints);
  const previewIndex = useSceneStore((state) => state.previewIndex);
  const selectObservation = useSceneStore((state) => state.selectObservation);
  const nextObservation = useSceneStore((state) => state.nextObservation);
  const prevObservation = useSceneStore((state) => state.prevObservation);

  // Enable preview mode and initialize observation points on mount.
  useEffect(() => {
    setPreviewMode(true);

    // Cleanup on unmount
    return () => {
      setPreviewMode(false);
    };
  }, [setPreviewMode]);

  // Initialize project when it loads
  useEffect(() => {
    if (!fetchedProject) return;

    if (!fetchedProject.isPublished) {
      throw new Error("Project not published");
    }
    setProject(fetchedProject);
    setActiveWorld(fetchedProject);

    // Initialize observation points from project data
    const sceneData = fetchedProject.sceneData as {
      observationPoints?: Array<{ id: string; [key: string]: unknown }>;
      [key: string]: unknown;
    } | null;
    if (sceneData && Array.isArray(sceneData.observationPoints)) {
      setObservationPoints(sceneData.observationPoints as unknown as Parameters<typeof setObservationPoints>[0]);
      // Select the first observation point if available
      if (sceneData.observationPoints.length > 0) {
        const firstPoint = sceneData.observationPoints[0];
        if (firstPoint && typeof firstPoint === 'object' && 'id' in firstPoint) {
          selectObservation(Number(firstPoint.id));
          useSceneStore.setState({ previewIndex: 0 });
        }
      }
    }

    // Initialize objects, selectedAssetId, selectedLocation, basemapType, and cesiumIonAssets
    if (fetchedProject.sceneData && typeof fetchedProject.sceneData === 'object') {
      const sceneData = fetchedProject.sceneData as {
        objects?: unknown[];
        selectedAssetId?: string;
        selectedLocation?: unknown;
        showTiles?: boolean;
        basemapType?: string;
        cesiumIonAssets?: unknown[];
        cesiumLightingEnabled?: boolean;
        cesiumShadowsEnabled?: boolean;
        cesiumCurrentTime?: unknown;
      };
      const {
        objects,
        selectedAssetId,
        selectedLocation,
        showTiles,
        basemapType,
        cesiumIonAssets,
        cesiumLightingEnabled,
        cesiumShadowsEnabled,
        cesiumCurrentTime,
      } = sceneData;

      // Initialize objects (GLB models, etc.)
      if (Array.isArray(objects)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        useSceneStore.setState({ objects: objects as any });
      }

      if (selectedAssetId && typeof selectedAssetId === 'string') {
        useSceneStore.setState({
          selectedAssetId,
          showTiles: showTiles ?? false,
        });
      }
      if (selectedLocation && typeof selectedLocation === 'object' && selectedLocation !== null && 'latitude' in selectedLocation && 'longitude' in selectedLocation) {
        useSceneStore.setState({ selectedLocation: selectedLocation as { latitude: number; longitude: number; altitude?: number } });
      }
      if (basemapType && typeof basemapType === 'string') {
        const validBasemapTypes = ["cesium", "none", "google", "google-photorealistic", "bing"] as const;
        if (validBasemapTypes.includes(basemapType as typeof validBasemapTypes[number])) {
          useSceneStore.setState({ basemapType: basemapType as typeof validBasemapTypes[number] });
        }
      }
      if (Array.isArray(cesiumIonAssets)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        useSceneStore.setState({ cesiumIonAssets: cesiumIonAssets as any });
      }
      // Restore time simulation settings
      if (cesiumLightingEnabled !== undefined) {
        useSceneStore.setState({ cesiumLightingEnabled });
      }
      if (cesiumShadowsEnabled !== undefined) {
        useSceneStore.setState({ cesiumShadowsEnabled });
      }
      if (cesiumCurrentTime !== undefined && cesiumCurrentTime !== null) {
        useSceneStore.setState({ cesiumCurrentTime: String(cesiumCurrentTime) });
      }
    }
  }, [fetchedProject, setActiveWorld, setObservationPoints, selectObservation]);

  // Cleanup function to prevent memory leaks on mobile devices
  useEffect(() => {
    return () => {
      setActiveWorld(null);
      // Clear Cesium viewer reference to allow proper cleanup
      const cesiumViewer = useSceneStore.getState().cesiumViewer;
      if (cesiumViewer) {
        try {
          // Clear all entities and primitives before destroying
          cesiumViewer.entities.removeAll();
          cesiumViewer.scene.primitives.removeAll();
          // Destroy viewer if it exists
          if (typeof cesiumViewer.destroy === 'function') {
            cesiumViewer.destroy();
          }
        } catch (cleanupError) {
          console.warn("Error during Cesium cleanup:", cleanupError);
        }
      }
      // Clear scene store state
      useSceneStore.setState({
        cesiumViewer: null,
        observationPoints: [],
        previewIndex: 0,
        objects: [],
        previewMode: false,
      });
    };
  }, [projectId, setObservationPoints, selectObservation, setActiveWorld]);

  if (loadingProject || !project) {
    return <LoadingScreen message="Loading project..." />;
  }

  if (!project) {
    return (
      <Box sx={{ p: 5 }}>
        <Typography variant="h6">
          Project not found or not published.
        </Typography>
      </Box>
    );
  }

  const currentObservation = observationPoints[previewIndex];

  return isMobile ? (
    <MobileLayout
      project={project}
      currentObservation={currentObservation}
      previewMode={previewMode}
      setPreviewMode={setPreviewMode}
      previewIndex={previewIndex}
      observationPoints={observationPoints}
      nextObservation={nextObservation}
      prevObservation={prevObservation}
      drawerOpen={drawerOpen}
      setDrawerOpen={setDrawerOpen}
    />
  ) : (
    <DesktopLayout
      project={project}
      currentObservation={currentObservation}
      previewMode={previewMode}
      setPreviewMode={setPreviewMode}
      previewIndex={previewIndex}
      observationPoints={observationPoints}
      nextObservation={nextObservation}
      prevObservation={prevObservation}
    />
  );
};

export default PublishedScenePage;
