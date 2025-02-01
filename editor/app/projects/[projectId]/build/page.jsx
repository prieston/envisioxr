// app/project/[projectId]/build/page.jsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Box } from "@mui/material";
import AdminLayout from "@/components/AdminLayout";
import SceneCanvas from "@/components/SceneCanvas";
import useSceneStore from "@/hooks/useSceneStore";

const BuilderPage = () => {
  const { projectId } = useParams();
  const [sceneData, setSceneData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get the resetScene action from your store to clear any previous state
  const resetScene = useSceneStore((state) => state.resetScene);

  // Reset the store when the project ID changes
  useEffect(() => {
    resetScene();
  }, [projectId, resetScene]);

  // Fetch the project's scene data from the API when the page mounts
  useEffect(() => {
    const fetchSceneData = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}`, {
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error("Failed to fetch project data");
        }
        const data = await res.json();
        // Expecting data.project.sceneData; if not provided, default to empty arrays.
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

  // Callback to update the scene data when changes occur in the SceneCanvas
  const handleSceneDataChange = useCallback((newData) => {
    setSceneData((prevData) => {
      // Use JSON.stringify for a simple deep comparison.
      if (JSON.stringify(prevData) === JSON.stringify(newData)) {
        return prevData;
      }
      return newData;
    });
  }, []);

  // Handler to save the scene: sends a POST request to update the project's sceneData
  const handleSave = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sceneData }),
      });
      if (!res.ok) throw new Error("Failed to save scene data");
      const data = await res.json();
      // Optionally, show a success notification here.
    } catch (error) {
      console.error("Error saving scene data:", error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    // Pass the handleSave function as the onSave prop
    <AdminLayout onSave={handleSave}>
      <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
        <SceneCanvas
          initialSceneData={sceneData}
          onSceneDataChange={handleSceneDataChange}
          projectId={projectId}
        />
      </Box>
    </AdminLayout>
  );
};

export default BuilderPage;
