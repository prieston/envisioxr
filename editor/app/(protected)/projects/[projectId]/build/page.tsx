"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, CircularProgress } from "@mui/material";
import AdminLayout from "@/components/Builder/AdminLayout";
import SceneCanvas from "@/components/Builder/SceneCanvas";
import useSceneStore from "@/hooks/useSceneStore";

const BuilderPage = () => {
  const { projectId } = useParams();
  const router = useRouter();
  const [sceneData, setSceneData] = useState(null);
  const [loading, setLoading] = useState(true);
  const resetScene = useSceneStore((state) => state.resetScene);

  useEffect(() => {
    resetScene();
  }, [projectId, resetScene]);

  useEffect(() => {
    const fetchSceneData = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch project data");
        const data = await res.json();
        setSceneData(
          data.project.sceneData || { objects: [], observationPoints: [] }
        );
      } catch (error) {
        console.error("Error fetching scene data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSceneData();
  }, [projectId]);

  const handleSceneDataChange = useCallback((newData) => {
    setSceneData(newData);
  }, []);

  const handleSave = async () => {
    try {
      // Sanitize sceneData by removing non-serializable properties (like 'ref')
      const sanitizeSceneData = (data: any) => {
        return {
          ...data,
          objects: data.objects.map(({ ref, ...rest }: any) => rest),
        };
      };

      const sanitizedSceneData = sanitizeSceneData(sceneData);

      const res = await fetch(`/api/projects/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sceneData: sanitizedSceneData }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to save scene data");
      const data = await res.json();
      // Optionally, show a toast notification
    } catch (error) {
      console.error("Error saving scene data:", error);
    }
  };

  const handlePublish = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publish: true }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to publish project");
      const data = await res.json();
      window.open(`/publish/${projectId}`, "_blank");
    } catch (error) {
      console.error("Error publishing project:", error);
    }
  };

  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );

  return (
    <AdminLayout onSave={handleSave} onPublish={handlePublish}>
      <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
        <SceneCanvas
          initialSceneData={sceneData}
          onSceneDataChange={handleSceneDataChange}
          renderObservationPoints={true}
        />
      </Box>
    </AdminLayout>
  );
};

export default BuilderPage;
