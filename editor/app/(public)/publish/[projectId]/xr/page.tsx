"use client";
import PreviewScene from "@/app/components/PreviewScene";
import useSceneStore from "@/app/hooks/useSceneStore";
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

        // Initialize selectedAssetId and selectedLocation
        if (data.project.sceneData) {
          const { selectedAssetId, selectedLocation } = data.project.sceneData;
          if (selectedAssetId) {
            useSceneStore.setState({ selectedAssetId });
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
