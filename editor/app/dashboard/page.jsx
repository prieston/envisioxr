// app/dashboard/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  CardActions,
  IconButton,
} from "@mui/material";
import { useRouter } from "next/navigation";
import AdminAppBar from "@/components/AppBar";
import InfoIcon from "@mui/icons-material/Info";

const useProjects = () => {
  const [projects, setProjects] = useState([]);
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/projects");
        if (!res.ok) throw new Error("Failed to fetch projects");
        const data = await res.json();
        setProjects(data.projects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchProjects();
  }, []);
  return { projects };
};

const DashboardPage = () => {
  const router = useRouter();
  const { projects } = useProjects();
  const [showInfo, setShowInfo] = useState(true);

  useEffect(() => {
    // Load user's preference from localStorage
    const infoDismissed = localStorage.getItem("dashboardInfoDismissed");
    if (infoDismissed === "true") {
      setShowInfo(false);
    }
  }, []);

  const handleDismissInfo = () => {
    setShowInfo(false);
    localStorage.setItem("dashboardInfoDismissed", "true");
  };

  const handleCreateProject = () => {
    router.push("/projects/create");
  };

  const handleGoToBuilder = (projectId) => {
    router.push(`/projects/${projectId}/build`);
  };

  return (
    <>
      <AdminAppBar mode="simple" />
      <Box sx={{ padding: 2 }}>
        {showInfo && (
          <Box
            sx={{
              padding: 2,
              borderRadius: 1,
              marginBottom: 3,
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <Typography variant="h6">
              Welcome to EnvisioXR Dashboard!
            </Typography>
            <Typography variant="body1">
              Learn how to build immersive scenes with our video tutorials and
              guided walkthroughs.
            </Typography>
            <br />
            <Button variant="outlined" onClick={handleDismissInfo}>
              Dismiss
            </Button>
          </Box>
        )}

        {/* Heading with Info Icon */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            paddingBottom: 2,
          }}
        >
          <Typography variant="h5">Your Projects</Typography>
          {/* Show the Info icon only when the info box is dismissed */}
          {!showInfo && (
            <IconButton
              onClick={() => {
                localStorage.setItem("dashboardInfoDismissed", "false");
                setShowInfo(true);
              }}
            >
              <InfoIcon />
            </IconButton>
          )}
        </Box>

        {/* Projects List */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          {projects.map((project) => (
            <Card key={project.id} sx={{ width: 300 }}>
              <CardContent>
                <Typography variant="h6">{project.title}</Typography>
                <Typography variant="body2">
                  {project.description || "No description provided"}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() => handleGoToBuilder(project.id)}
                >
                  Go To Builder
                </Button>
              </CardActions>
            </Card>
          ))}
          {/* Create Project Card */}
          <Card
            sx={{
              width: 300,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              border: "2px dashed #aaa",
            }}
            onClick={handleCreateProject}
          >
            <CardContent>
              <Typography variant="h4" align="center">
                +
              </Typography>
              <Typography variant="subtitle1" align="center">
                Create Project
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </>
  );
};

export default DashboardPage;
