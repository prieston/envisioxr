"use client";
import PreviewScene from "@/app/components/Builder/Scene/PreviewScene";
import { useSceneStore } from "@envisio/core";
import { LoadingScreen } from "@envisio/ui";
import { Box, Typography } from "@mui/material";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import useProject from "@/app/hooks/useProject";

export default function Scene() {
  const { projectId } = useParams();
  const { project: fetchedProject, loadingProject } = useProject(projectId as string);
  const [project, setProject] = useState(null);

  // Destructure necessary state and actions from the store.
  const { setPreviewMode } = useSceneStore();

  // Enable preview mode on mount.
  useEffect(() => {
    setPreviewMode(true);
  }, [setPreviewMode]);

  // Initialize project when it loads
  useEffect(() => {
    if (!fetchedProject) return;

    if (!fetchedProject.isPublished) {
      throw new Error("Project not published");
    }
    setProject(fetchedProject);

    // Initialize objects, selectedAssetId, selectedLocation, basemapType, and cesiumIonAssets
    if (fetchedProject.sceneData) {
      const {
        objects,
        selectedAssetId,
        selectedLocation,
        basemapType,
        cesiumIonAssets,
        cesiumLightingEnabled,
        cesiumShadowsEnabled,
        cesiumCurrentTime,
      } = fetchedProject.sceneData;

          // Initialize objects (GLB models, etc.)
          if (Array.isArray(objects)) {
            useSceneStore.setState({ objects });
          }

          if (selectedAssetId) {
            useSceneStore.setState({ selectedAssetId });
          }
          if (selectedLocation) {
            useSceneStore.setState({ selectedLocation });
          }
          if (basemapType) {
            useSceneStore.setState({ basemapType });
          }
          if (Array.isArray(cesiumIonAssets)) {
            useSceneStore.setState({ cesiumIonAssets });
          }
          // Restore time simulation settings
          if (cesiumLightingEnabled !== undefined) {
            useSceneStore.setState({ cesiumLightingEnabled });
          }
          if (cesiumShadowsEnabled !== undefined) {
            useSceneStore.setState({ cesiumShadowsEnabled });
          }
          if (cesiumCurrentTime !== undefined) {
            useSceneStore.setState({ cesiumCurrentTime });
      }
    }
  }, [fetchedProject]);

  if (loadingProject || !project) {
    return <LoadingScreen message="Loading XR scene..." />;
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
  return (
    <PreviewScene
      initialSceneData={project.sceneData}
      renderObservationPoints={false}
      enableXR={true}
    />
  );
}
