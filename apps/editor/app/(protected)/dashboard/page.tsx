"use client";

import React, { useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { useRouter } from "next/navigation";
import useProjects from "../../hooks/useProjects";
import {
  DashboardCreateProjectCard as CreateProjectCard,
  DashboardProjectCard as ProjectCard,
  DashboardOptionsMenu as OptionsMenu,
  DashboardDeleteConfirmationDialog as DeleteConfirmationDialog,
} from "@envisio/ui";
import DashboardSidebar from "@/app/components/Dashboard/DashboardSidebar";
import {
  AnimatedBackground,
  GlowingContainer,
  GlowingSpan,
} from "@/app/components/Builder/AdminLayout.styles";

const DashboardPage = () => {
  const router = useRouter();
  const { projects, setProjects, loadingProjects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const handleCreateProject = () => {
    router.push("/projects/create");
  };

  const handleProjectSelect = (projectId) => {
    setSelectedProjectId(selectedProjectId === projectId ? null : projectId);
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
      // Use SWR's mutate to update the cache
      setProjects((prevProjects) =>
        prevProjects.filter((project) => project.id !== menuProjectId)
      );
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  return (
    <>
      {/* Animated background */}
      <AnimatedBackground>
        <GlowingContainer>
          <GlowingSpan index={1} />
          <GlowingSpan index={2} />
          <GlowingSpan index={3} />
        </GlowingContainer>
        <GlowingContainer>
          <GlowingSpan index={1} />
          <GlowingSpan index={2} />
          <GlowingSpan index={3} />
        </GlowingContainer>
        <GlowingContainer>
          <GlowingSpan index={1} />
          <GlowingSpan index={2} />
          <GlowingSpan index={3} />
        </GlowingContainer>
        <GlowingContainer>
          <GlowingSpan index={1} />
          <GlowingSpan index={2} />
          <GlowingSpan index={3} />
        </GlowingContainer>
      </AnimatedBackground>

      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main Content Area */}
      <Box
        sx={(theme) => ({
          marginLeft: "392px", // Match sidebar width (360px + 16px left + 16px gap)
          padding: "24px",
          minHeight: "100vh",
          position: "relative",
          zIndex: 1,
          backgroundColor: theme.palette.background.default,
        })}
      >
        <Box
          sx={{
            paddingBottom: 3,
          }}
        >
          <Typography variant="h5" sx={{ color: "text.primary", fontWeight: 600 }}>
            Your Projects
          </Typography>
        </Box>

        {loadingProjects ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "400px",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onGoToBuilder={handleGoToBuilder}
                onMenuOpen={handleMenuOpen}
                selected={selectedProjectId === project.id}
                onSelect={handleProjectSelect}
              />
            ))}
            <CreateProjectCard
              onClick={handleCreateProject}
              selected={selectedProjectId === "create"}
              onSelect={() => handleProjectSelect("create")}
            />
          </Box>
        )}
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
