"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { useRouter } from "next/navigation";
import AdminAppBar from "@/components/AppBar";
import InfoIcon from "@mui/icons-material/Info";
import MoreVertIcon from "@mui/icons-material/MoreVert";

// Simulated hook for fetching projects. Replace with your actual API fetching logic.
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
  return { projects, setProjects };
};

const DashboardPage = () => {
  const router = useRouter();
  const { projects, setProjects } = useProjects();
  const [showInfo, setShowInfo] = useState(true);

  useEffect(() => {
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

  // --- Options Menu State ---
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuProjectId, setMenuProjectId] = useState(null);
  const openMenu = Boolean(anchorEl);

  const handleMenuOpen = (event, projectId) => {
    setMenuProjectId(projectId);
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // --- Delete Confirmation Dialog State ---
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
    handleMenuClose();
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
  };

  const handleDeleteConfirm = async () => {
    debugger;
    try {
      const res = await fetch(`/api/projects/${menuProjectId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete project");
      // Optionally remove the project from the local state:
      setProjects((prevProjects) =>
        prevProjects.filter((project) => project.id !== menuProjectId)
      );
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const handleEdit = () => {
    // For editing, navigate to an edit page (e.g. /projects/[projectId]/edit)
    router.push(`/projects/${menuProjectId}/edit`);
    handleMenuClose();
  };

  return (
    <>
      <AdminAppBar mode="simple" />

      <Box sx={{ padding: 5 }}>
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

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            paddingBottom: 2,
          }}
        >
          <Typography variant="h5">Your Projects</Typography>
          {!showInfo && (
            <IconButton onClick={() => setShowInfo(true)}>
              <InfoIcon />
            </IconButton>
          )}
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          {projects.map((project) => (
            <Card key={project.id} sx={{ width: 300, position: "relative" }}>
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
                {/* Three dots menu for edit/delete */}
                <IconButton
                  onClick={(e) => handleMenuOpen(e, project.id)}
                  sx={{ position: "absolute", top: 4, right: 4 }}
                >
                  <MoreVertIcon />
                </IconButton>
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

      {/* Options Menu */}
      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={handleEdit}>Edit</MenuItem>
        <MenuItem onClick={handleDeleteClick}>Delete</MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this project? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DashboardPage;
