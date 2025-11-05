"use client";

import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useRouter } from "next/navigation";
import AdminAppBar from "@/app/components/AppBar/AdminAppBar.tsx";

const CreateProjectPage = () => {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [engine, setEngine] = useState("three");

  const handleSave = async () => {
    try {
      const res = await fetch("/api/projects", {
        credentials: "include",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          engine,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to create project");
      }
      router.push("/dashboard");
    } catch (error) {
      console.error("Error saving project:", error);
    }
  };

  return (
    <>
      <AdminAppBar mode="simple" />
      <Box sx={{ padding: 3, marginTop: "64px" }}>
        <Typography variant="h5" gutterBottom>
          Create New Project
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
            Save Project
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default CreateProjectPage;
