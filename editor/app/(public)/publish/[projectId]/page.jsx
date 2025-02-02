"use client";

import React, { useEffect, useState } from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import useSceneStore from "@/hooks/useSceneStore";

// Dynamically import the PreviewScene component with SSR disabled.
const PreviewScene = dynamic(() => import("@/components/PreviewScene"), {
  ssr: false,
});

const PublishedScenePage = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Destructure the needed state and actions from the store.
  const {
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

  // Fetch the project data.
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

  // When project data loads, update the store's observationPoints.
  useEffect(() => {
    if (
      project &&
      project.sceneData &&
      project.sceneData.observationPoints &&
      project.sceneData.observationPoints.length > 0
    ) {
      setObservationPoints(project.sceneData.observationPoints);
      // Select the first observation point by default.
      selectObservationPoint(project.sceneData.observationPoints[0].id);
    }
  }, [project, setObservationPoints, selectObservationPoint]);

  // When previewIndex changes, update the selected observation using the store's observationPoints.
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

  // Use the selected observation from the store for display.
  const currentObservation =
    selectedObservation ||
    (observationPoints && observationPoints.length > 0
      ? observationPoints[0]
      : null);

  if (loading) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!project) {
    return (
      <Box sx={{ padding: 5 }}>
        <Typography variant="h6">
          Project not found or not published.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* Left Side Panel */}
      <Box
        sx={{
          width: "300px",
          backgroundColor: "background.paper",
          padding: 2,
          borderRight: "1px solid rgba(0,0,0,0.1)",
        }}
      >
        <Typography variant="h4" gutterBottom>
          {project.title}
        </Typography>
        <Typography variant="body1" gutterBottom>
          {project.description}
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Observation Point Details
          </Typography>
          {currentObservation ? (
            <>
              <Typography variant="subtitle1">
                {currentObservation.title || "Untitled"}
              </Typography>
              <Typography variant="body2">
                {currentObservation.description || "No description provided."}
              </Typography>
            </>
          ) : (
            <Typography variant="body2">
              No observation point selected.
            </Typography>
          )}
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          <Button
            variant="outlined"
            onClick={prevObservation}
            disabled={previewIndex === 0}
          >
            Previous
          </Button>
          <Button
            variant="outlined"
            onClick={nextObservation}
            disabled={
              !observationPoints || previewIndex >= observationPoints.length - 1
            }
          >
            Next
          </Button>
        </Box>
      </Box>

      {/* Right Side: Preview Scene */}
      <Box sx={{ flexGrow: 1, position: "relative" }}>
        <PreviewScene initialSceneData={project.sceneData} />
      </Box>
    </Box>
  );
};

export default PublishedScenePage;
