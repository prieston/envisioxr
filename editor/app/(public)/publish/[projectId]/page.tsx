"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CircularProgress, Typography } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import useSceneStore from "@/app/hooks/useSceneStore";
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

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Destructure necessary state and actions from the store.
  const {
    previewMode,
    setPreviewMode,
    setObservationPoints,
    observationPoints,
    previewIndex,
    selectObservation,
    nextObservation,
    prevObservation,
  } = useSceneStore();

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

        // Initialize observation points from project data
        if (
          data.project.sceneData &&
          data.project.sceneData.observationPoints
        ) {
          setObservationPoints(data.project.sceneData.observationPoints);
          // Select the first observation point if available
          if (data.project.sceneData.observationPoints.length > 0) {
            selectObservation(data.project.sceneData.observationPoints[0].id);
          }
        }

        // Initialize selectedAssetId and selectedLocation
        if (data.project.sceneData) {
          const { selectedAssetId, selectedLocation } = data.project.sceneData;
          if (selectedAssetId) {
            useSceneStore.setState({
              selectedAssetId,
              showTiles: true,
            });
          }
          if (selectedLocation) {
            useSceneStore.setState({ selectedLocation });
          }
        }
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, setObservationPoints, selectObservation]);

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
