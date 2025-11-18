"use client";

import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
// eslint-disable-next-line import/extensions
import AdminAppBar from "@/app/components/AppBar/AdminAppBar";
import { createProject } from "@/app/utils/api";
import { useOrgId } from "@/app/hooks/useOrgId";

const CreateProjectPage = () => {
  const router = useRouter();
  const orgId = useOrgId();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [engine] = useState("cesium");

  const handleSave = async () => {
    try {
      if (!orgId) {
        throw new Error("Organization ID is required");
      }
      await createProject({
        title,
        description,
        engine: engine as "three" | "cesium",
        organizationId: orgId,
      });
      router.push(`/org/${orgId}/dashboard`);
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
          <Button variant="contained" onClick={handleSave}>
            Save Project
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default CreateProjectPage;
