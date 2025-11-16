"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
// eslint-disable-next-line import/extensions
import AdminAppBar from "@/app/components/AppBar/AdminAppBar";
import { showToast } from "@envisio/ui";
import { ToastContainer } from "react-toastify";
import useProject from "@/app/hooks/useProject";
import { updateProject } from "@/app/utils/api";

const EditProjectPage = () => {
  const { projectId } = useParams();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [engine, setEngine] = useState("three");
  const { project, loadingProject } = useProject(projectId as string);

  // Sync project data to form when it loads
  useEffect(() => {
    if (project) {
      setTitle(project.title);
      setDescription(project.description || "");
      setEngine(project.engine || "three");
    }
  }, [project]);

  const loading = loadingProject;

  // Handler to save updated project details
  const handleSave = async () => {
    try {
      await updateProject(projectId, { title, description, engine: engine as "three" | "cesium" });
      showToast("Project saved successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error saving project details:", error);
      showToast(error.message || "Error saving project");
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <AdminAppBar mode="simple" />
      <Box sx={{ padding: 3, marginTop: "64px" }}>
        <Typography variant="h5" gutterBottom>
          Edit Project
        </Typography>
        <Box
          component="form"
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            id="project-title"
            name="project-title"
            label="Project Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
          />
          <TextField
            id="project-description"
            name="project-description"
            label="Project Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={4}
          />
          <FormControl fullWidth>
            <InputLabel id="engine-select-label">Rendering Engine</InputLabel>
            <Select
              labelId="engine-select-label"
              id="engine-select"
              value={engine}
              label="Rendering Engine"
              onChange={(e) => setEngine(e.target.value)}
            >
              <MenuItem value="three">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography>Three.js</Typography>
                  <Typography variant="caption" color="text.secondary">
                    - 3D scene with custom models and effects
                  </Typography>
                </Box>
              </MenuItem>
              <MenuItem value="cesium">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography>Cesium</Typography>
                  <Typography variant="caption" color="text.secondary">
                    - 3D globe with terrain and geospatial data
                  </Typography>
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" onClick={handleSave}>
            Save Changes
          </Button>
        </Box>
      </Box>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        theme="dark"
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />
    </>
  );
};

export default EditProjectPage;
