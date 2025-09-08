"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Box, CircularProgress } from "@mui/material";
import AdminLayout from "../../../../../app/components/Builder/AdminLayout";
import SceneCanvas from "../../../../../app/components/Builder/SceneCanvas";
import useSceneStore from "../../../../../app/hooks/useSceneStore";
import useWorldStore from "../../../../../app/hooks/useWorldStore";
import { showToast } from "../../../../../app/utils/toastUtils";
import { toast } from "react-toastify";

// Function to sanitize scene data before saving
const sanitizeSceneData = (
  objects,
  observationPoints,
  selectedAssetId,
  selectedLocation,
  showTiles,
  basemapType
) => {
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
      const { ...rest } = obj;
      return {
        id: rest.id || "",
        name: rest.name || "",
        url: rest.url || "",
        type: rest.type || "model",
        position: rest.position || [0, 0, 0],
        rotation: rest.rotation || [0, 0, 0],
        scale: rest.scale || [1, 1, 1],
        assetId: rest.assetId || undefined,
      };
    })
    .filter(Boolean);

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

  // Clean up selected location
  const cleanSelectedLocation = selectedLocation
    ? {
        latitude: selectedLocation.latitude || 0,
        longitude: selectedLocation.longitude || 0,
      }
    : null;

  return {
    objects: cleanObjects,
    observationPoints: cleanObservationPoints,
    selectedAssetId: selectedAssetId || "2275207",
    selectedLocation: cleanSelectedLocation,
    showTiles,
    basemapType: basemapType || "cesium",
  };
};

export default function BuilderPage() {
  const { projectId } = useParams();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const setActiveWorld = useWorldStore((s) => s.setActiveWorld);

  // Get scene data and actions from store
  const setObjects = useSceneStore((state) => state.setObjects);
  const setObservationPoints = useSceneStore(
    (state) => state.setObservationPoints
  );

  // Fetch project data and initialize scene on mount
  useEffect(() => {
    const fetchProject = async () => {
      try {
        // Reset scene state first
        useSceneStore.getState().resetScene();

        const res = await fetch(`/api/projects/${projectId}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch project");
        const data = await res.json();
        setProject(data.project);
        setActiveWorld(data.project);

        // Initialize scene data from project
        if (data.project?.sceneData) {
          const {
            objects,
            observationPoints,
            selectedAssetId,
            selectedLocation,
            showTiles,
            basemapType,
          } = data.project.sceneData;

          if (Array.isArray(objects)) {
            setObjects(objects);
          }
          if (Array.isArray(observationPoints)) {
            setObservationPoints(observationPoints);
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
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        showToast("Error loading project");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
    return () => setActiveWorld(null);
  }, [projectId, setObjects, setObservationPoints, setActiveWorld]);

  // Save handler
  const handleSave = async () => {
    if (isSaving) return;
    try {
      setIsSaving(true);

      // Get the current state from the store
      const storeState = useSceneStore.getState();

      // Sanitize the scene data
      const sceneData = sanitizeSceneData(
        storeState.objects,
        storeState.observationPoints,
        storeState.selectedAssetId,
        storeState.selectedLocation,
        storeState.showTiles,
        storeState.basemapType
      );

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

      await res.json();
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
