"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  AppBar,
} from "@mui/material";
import { useRouter } from "next/navigation";
import InfoIcon from "@mui/icons-material/Info";
import useProjects from "@/app/hooks/useProjects";
import CreateProjectCard from "@/app/components/Dashboard/CreateProjectCard";
import ProjectCard from "@/app/components/Dashboard/ProjectCard";
import OptionsMenu from "@/app/components/Dashboard/OptionsMenu";
import DeleteConfirmationDialog from "@/app/components/Dashboard/DeleteConfirmationDialog";
import InfoBox from "@/app/components/Dashboard/InfoBox";
import AdminAppBar from "@/app/components/AppBar/AdminAppBar";

const DashboardPage = () => {
  const router = useRouter();
  const { projects, setProjects, loadingProjects } = useProjects();
  const [showInfo, setShowInfo] = useState(true);
  const [infoLoaded, setInfoLoaded] = useState(false);

  // Load the user's info preference from localStorage.
  useEffect(() => {
    const infoDismissed = localStorage.getItem("dashboardInfoDismissed");
    setShowInfo(infoDismissed !== "true");
    setInfoLoaded(true);
  }, []);

  const handleDismissInfo = () => {
    setShowInfo(false);
    localStorage.setItem("dashboardInfoDismissed", "true");
  };

  const handleCreateProject = () => {
    router.push("/projects/create");
  };

  const handleGoToBuilder = (projectId) => {
    router.push(`/projects/${projectId}/builder`);
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

  const handleEdit = () => {
    router.push(`/projects/${menuProjectId}/edit`);
    handleMenuClose();
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
    try {
      const res = await fetch(`/api/projects/${menuProjectId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete project");
      setProjects((prevProjects) =>
        prevProjects.filter((project) => project.id !== menuProjectId)
      );
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  // Render a loader until projects and info preference are loaded.
  if (loadingProjects || !infoLoaded) {
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

      <Box sx={{ padding: 5, marginTop: "64px" }}>
        {showInfo && <InfoBox onDismiss={handleDismissInfo} />}

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
            <ProjectCard
              key={project.id}
              project={project}
              onGoToBuilder={handleGoToBuilder}
              onMenuOpen={handleMenuOpen}
            />
          ))}
          <CreateProjectCard onClick={handleCreateProject} />
        </Box>
      </Box>

      <OptionsMenu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleMenuClose}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      <DeleteConfirmationDialog
        open={openDeleteDialog}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};

export default DashboardPage;
