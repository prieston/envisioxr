"use client";
import PreviewScene from "@/app/components/Builder/Scene/PreviewScene";
import { useSceneStore } from "@envisio/core/state";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Scene() {
  const { projectId } = useParams();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);

  // Destructure necessary state and actions from the store.
  const { setPreviewMode } = useSceneStore();

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

        // Initialize objects, selectedAssetId, selectedLocation, basemapType, and cesiumIonAssets
        if (data.project.sceneData) {
          const {
            objects,
            selectedAssetId,
            selectedLocation,
            basemapType,
            cesiumIonAssets,
          } = data.project.sceneData;

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
        }
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

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
