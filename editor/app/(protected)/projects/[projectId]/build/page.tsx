"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box } from "@mui/material";
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
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sceneData }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to save scene data");
      const data = await res.json();
      console.log("Scene data saved:", data.project);
      // Optionally show a toast notification
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
      console.log("Project published:", data.project);
      router.push(`/publish/${projectId}`);
    } catch (error) {
      console.error("Error publishing project:", error);
    }
  };

  if (loading) return <div>Loading...</div>;

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
