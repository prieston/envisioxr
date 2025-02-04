"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { CircularProgress, Typography } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import useSceneStore from "@/hooks/useSceneStore";
import MobileLayout from "@/components/PublishPage/MobileLayout";
import DesktopLayout from "@/components/PublishPage/DesktopLayout";

const LoadingContainer = styled("div")(({ theme }) => ({
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
    selectObservationPoint,
    observationPoints,
    previewIndex,
    selectedObservation,
    nextObservation,
    prevObservation,
  } = useSceneStore();

  // Enable preview mode on mount.
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
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  // When project data loads, update the store's observation points and select the first one.
  useEffect(() => {
    if (
      project &&
      project.sceneData &&
      project.sceneData.observationPoints &&
      project.sceneData.observationPoints.length > 0
    ) {
      setObservationPoints(project.sceneData.observationPoints);
      selectObservationPoint(project.sceneData.observationPoints[0].id);
    }
  }, [project, setObservationPoints, selectObservationPoint]);

  // When previewIndex changes, update the selected observation.
  useEffect(() => {
    if (
      observationPoints &&
      observationPoints.length > 0 &&
      previewIndex >= 0 &&
      previewIndex < observationPoints.length
    ) {
      selectObservationPoint(observationPoints[previewIndex].id);
    }
  }, [previewIndex, observationPoints, selectObservationPoint]);

  // Use the selected observation for display.
  const currentObservation =
    selectedObservation ||
    (observationPoints && observationPoints.length > 0
      ? observationPoints[0]
      : null);

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
