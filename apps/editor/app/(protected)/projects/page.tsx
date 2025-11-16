"use client";

import React, { useState } from "react";
import { Box, Button, CircularProgress } from "@mui/material";
import { useRouter } from "next/navigation";
import useProjects from "../../hooks/useProjects";
import {
  DashboardCreateProjectCard as CreateProjectCard,
  DashboardProjectCard as ProjectCard,
  DashboardOptionsMenu as OptionsMenu,
  DashboardDeleteConfirmationDialog as DeleteConfirmationDialog,
  Page,
  PageHeader,
  PageDescription,
  PageActions,
  PageContent,
} from "@envisio/ui";
import {
  AnimatedBackground,
  GlowingContainer,
  GlowingSpan,
} from "@/app/components/Builder/AdminLayout.styles";

const ProjectsPage = () => {
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

  // --- Delete Confirmation Dialog State ---
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const handleDeleteClick = (projectId) => {
    setProjectToDelete(projectId);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;

    try {
      const response = await fetch(`/api/projects/${projectToDelete}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      // Optimistically update the projects list
      setProjects((prevProjects) =>
        prevProjects.filter((p) => p.id !== projectToDelete)
      );

      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Failed to delete project. Please try again.");
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

      <Page>
        <PageHeader title="Projects" />
        <PageDescription>
          Create and manage your 3D visualization projects
        </PageDescription>

        <PageActions>
          <Button variant="contained" onClick={handleCreateProject}>
            + Create Project
          </Button>
        </PageActions>

        <PageContent maxWidth="6xl">
          {loadingProjects ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "400px",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: 3,
              }}
            >
              <CreateProjectCard onClick={handleCreateProject} />

              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onGoToBuilder={() => handleGoToBuilder(project.id)}
                  onMenuOpen={(event) => handleMenuOpen(event, project.id)}
                  selected={selectedProjectId === project.id}
                  onSelect={() => handleProjectSelect(project.id)}
                />
              ))}
            </Box>
          )}
        </PageContent>

        {/* Options Menu */}
        <OptionsMenu
          anchorEl={anchorEl}
          open={openMenu}
          onClose={handleMenuClose}
          onDelete={() => handleDeleteClick(menuProjectId)}
          projectId={menuProjectId}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          projectName={
            projects.find((p) => p.id === projectToDelete)?.name || ""
          }
        />
      </Page>
    </>
  );
};

export default ProjectsPage;

