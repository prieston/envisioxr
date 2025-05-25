"use client";

import React, { useState } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import AdminAppBar from "@/app/components/AppBar/AdminAppBar";

const CreateProjectPage = () => {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = async () => {
    try {
      const res = await fetch("/api/projects", {
        credentials: "include",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
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
            label="Project Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
          />
          <TextField
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
