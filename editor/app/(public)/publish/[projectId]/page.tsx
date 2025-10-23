"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CircularProgress, Typography } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useSceneStore, useWorldStore } from "@envisio/core";
import MobileLayout from "@/app/components/PublishPage/MobileLayout";
import DesktopLayout from "@/app/components/PublishPage/DesktopLayout";

const LoadingContainer = styled("div")(() => ({
  height: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const ErrorContainer = styled("div")(({ theme }) => ({
  padding: theme.spacing(5),
}));

const PublishedScenePage = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
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
  }, [setPreviewMode]);

  // Fetch project data.
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch project data");
        const data = await res.json();
        if (!data.project || !data.project.isPublished) {
          throw new Error("Project not published");
        }
        setProject(data.project);
        setActiveWorld(data.project);

        // Initialize observation points from project data
        if (
          data.project.sceneData &&
          data.project.sceneData.observationPoints
        ) {
          setObservationPoints(data.project.sceneData.observationPoints);
          // Select the first observation point if available
          if (data.project.sceneData.observationPoints.length > 0) {
            selectObservation(data.project.sceneData.observationPoints[0].id);
            useSceneStore.setState({ previewIndex: 0 });
          }
        }

        // Initialize objects, selectedAssetId, selectedLocation, basemapType, and cesiumIonAssets
        if (data.project.sceneData) {
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
          } = data.project.sceneData;

          // Initialize objects (GLB models, etc.)
          if (Array.isArray(objects)) {
            useSceneStore.setState({ objects });
          }

          if (selectedAssetId) {
            useSceneStore.setState({
              selectedAssetId,
              showTiles: showTiles ?? false,
            });
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
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
    return () => setActiveWorld(null);
  }, [projectId, setObservationPoints, selectObservation, setActiveWorld]);

  if (loading) {
    return (
      <LoadingContainer>
        <CircularProgress />
      </LoadingContainer>
    );
  }

  if (!project) {
    return (
      <ErrorContainer>
        <Typography variant="h6">
          Project not found or not published.
        </Typography>
      </ErrorContainer>
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
