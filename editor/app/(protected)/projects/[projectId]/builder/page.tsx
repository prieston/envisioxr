"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Box, CircularProgress } from "@mui/material";
import AdminLayout from "../../../../../app/components/Builder/AdminLayout";
import SceneCanvas from "../../../../../app/components/Builder/SceneCanvas";
import useSceneStore from "../../../../../app/hooks/useSceneStore";
import { showToast } from "../../../../../app/utils/toastUtils";
import { toast } from "react-toastify";

// Function to sanitize scene data before saving
const sanitizeSceneData = (objects, observationPoints) => {
  console.log("Sanitizing scene data:", { objects, observationPoints });

  // Ensure we have valid arrays to work with
  const safeObjects = Array.isArray(objects) ? objects : [];
  const safeObservationPoints = Array.isArray(observationPoints)
    ? observationPoints
    : [];

  // Clean up objects by removing any undefined or null values
  // and removing any circular references (like refs)
  const cleanObjects = safeObjects
    .map((obj) => {
      if (!obj) return null;

      // Remove any circular references and undefined values
      const { ref, ...rest } = obj;
      return {
        id: rest.id || "",
        name: rest.name || "",
        url: rest.url || "",
        type: rest.type || "model",
        position: rest.position || [0, 0, 0],
        rotation: rest.rotation || [0, 0, 0],
        scale: rest.scale || [1, 1, 1],
      };
    })
    .filter(Boolean); // Remove any null entries

  // Clean up observation points
  const cleanObservationPoints = safeObservationPoints
    .map((point) => {
      if (!point) return null;

      // Handle position and target data
      let position = null;
      let target = null;

      if (point.position) {
        // If position is already an array, use it directly
        if (Array.isArray(point.position)) {
          position = point.position;
        }
        // If position is a Vector3, convert to array
        else if (point.position.x !== undefined) {
          position = [point.position.x, point.position.y, point.position.z];
        }
      }

      if (point.target) {
        // If target is already an array, use it directly
        if (Array.isArray(point.target)) {
          target = point.target;
        }
        // If target is a Vector3, convert to array
        else if (point.target.x !== undefined) {
          target = [point.target.x, point.target.y, point.target.z];
        }
      }

      return {
        id: point.id || 0,
        title: point.title || "",
        description: point.description || "",
        position,
        target,
      };
    })
    .filter(Boolean);

  console.log("Cleaned scene data:", {
    objects: cleanObjects,
    observationPoints: cleanObservationPoints,
  });

  return {
    objects: cleanObjects,
    observationPoints: cleanObservationPoints,
  };
};

export default function BuilderPage() {
  const { projectId } = useParams();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Get scene data and actions from store
  const objects = useSceneStore((state) => state.objects);
  const observationPoints = useSceneStore((state) => state.observationPoints);
  const setObjects = useSceneStore((state) => state.setObjects);
  const setObservationPoints = useSceneStore(
    (state) => state.setObservationPoints
  );

  // Debug store state
  useEffect(() => {
    console.log("Current store state:", { objects, observationPoints });
  }, [objects, observationPoints]);

  // Fetch project data and initialize scene on mount
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch project");
        const data = await res.json();
        console.log("Fetched project data:", data.project);
        setProject(data.project);

        // Initialize scene data from project
        if (data.project?.sceneData) {
          const { objects, observationPoints } = data.project.sceneData;
          console.log("Initializing scene data:", {
            objects,
            observationPoints,
          });
          if (Array.isArray(objects)) {
            setObjects(objects);
          }
          if (Array.isArray(observationPoints)) {
            setObservationPoints(observationPoints);
          }
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        showToast("Error loading project");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, setObjects, setObservationPoints]);

  // Save handler
  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Get the current state from the store
      const storeState = useSceneStore.getState();
      console.log("Current store state:", storeState);

      // Sanitize the scene data
      const sceneData = sanitizeSceneData(
        storeState.objects,
        storeState.observationPoints
      );
      console.log("Sanitized scene data:", sceneData);

      const response = await fetch(`/api/projects/${projectId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sceneData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save project");
      }

      toast.success("Project saved successfully");
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error(error.message || "Failed to save project");
    } finally {
      setIsSaving(false);
    }
  };

  // Publish handler
  const handlePublish = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ publish: true }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to publish project");
      }

      const data = await res.json();
      showToast("Project published successfully!");

      // Open the published world in a new window
      window.open(`/publish/${projectId}`, "_blank");
    } catch (error) {
      console.error("Error publishing project:", error);
      showToast(error.message || "Error publishing project");
    }
  };

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

  return (
    <AdminLayout onSave={handleSave} onPublish={handlePublish}>
      <SceneCanvas
        initialSceneData={project?.sceneData}
        renderObservationPoints={true}
      />
    </AdminLayout>
  );
}
