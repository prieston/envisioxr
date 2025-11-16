"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  InputAdornment,
  Drawer,
  Typography,
  Select,
  MenuItem,
  IconButton,
  Divider,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { useRouter } from "next/navigation";
import useProjects from "../../hooks/useProjects";
import {
  DashboardProjectCard as ProjectCard,
  DashboardOptionsMenu as OptionsMenu,
  DashboardDeleteConfirmationDialog as DeleteConfirmationDialog,
  Page,
  PageHeader,
  PageDescription,
  PageContent,
  textFieldStyles,
  selectStyles,
  menuItemStyles,
  SettingContainer,
  SettingLabel,
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

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [newProjectEngine, setNewProjectEngine] = useState("three");
  const [savingProject, setSavingProject] = useState(false);

  const handleCreateProject = () => {
    setEditingProjectId(null);
    setNewProjectTitle("");
    setNewProjectDescription("");
    setNewProjectEngine("three");
    setDrawerOpen(true);
  };

  const handleEditProject = (projectId) => {
    const project = projects.find((p) => p.id === projectId);
    if (project) {
      setEditingProjectId(projectId);
      setNewProjectTitle(project.title || "");
      setNewProjectDescription(project.description || "");
      setNewProjectEngine(project.engine || "three");
      setDrawerOpen(true);
    }
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setEditingProjectId(null);
    setNewProjectTitle("");
    setNewProjectDescription("");
    setNewProjectEngine("three");
  };

  const handleSaveProject = async () => {
    if (!newProjectTitle.trim()) return;

    setSavingProject(true);
    try {
      const isEditing = !!editingProjectId;
      const url = isEditing
        ? `/api/projects/${editingProjectId}`
        : "/api/projects";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        credentials: "include",
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newProjectTitle.trim(),
          description: newProjectDescription.trim(),
          engine: newProjectEngine,
        }),
      });

      if (!res.ok) {
        throw new Error(
          isEditing ? "Failed to update project" : "Failed to create project"
        );
      }

      const data = await res.json();
      const project = data.project || data;

      if (isEditing) {
        // Update the project in the list
        setProjects((prev) =>
          prev.map((p) => (p.id === editingProjectId ? project : p))
        );
      } else {
        // Add the new project to the list
        setProjects((prev) => [project, ...prev]);
        // Navigate to the builder for new projects
        router.push(`/projects/${project.id}/builder`);
      }

      // Close drawer and reset form
      handleCloseDrawer();
    } catch (error) {
      console.error("Error saving project:", error);
      // TODO: Show error toast
    } finally {
      setSavingProject(false);
    }
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
          Your 3D environments, scenes, and digital twins in one place.
        </PageDescription>

        <PageContent maxWidth="6xl">
          {/* Search Toolbar */}
          <Box
            sx={(theme) => ({
              display: "flex",
              gap: 2,
              mb: 3,
              pb: 3,
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: `1px solid ${theme.palette.divider}`,
            })}
          >
            <Box
              sx={{ display: "flex", gap: 2, alignItems: "center", flex: 1 }}
            >
              <TextField
                placeholder="Search projects..."
                size="small"
                fullWidth
                sx={(theme) => ({
                  maxWidth: "400px",
                  ...((typeof textFieldStyles === "function"
                    ? textFieldStyles(theme)
                    : textFieldStyles) as Record<string, any>),
                })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon
                        sx={(theme) => ({
                          color: theme.palette.text.secondary,
                        })}
                      />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Button
              variant="contained"
              onClick={handleCreateProject}
              size="small"
              sx={(theme) => ({
                borderRadius: `${theme.shape.borderRadius}px`,
                textTransform: "none",
                fontWeight: 500,
                fontSize: "0.75rem",
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "#161B20"
                    : theme.palette.background.paper,
                color: theme.palette.primary.main,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                padding: "6px 16px",
                boxShadow: "none",
                "&:hover": {
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "#1a1f26"
                      : alpha(theme.palette.primary.main, 0.05),
                  borderColor: alpha(theme.palette.primary.main, 0.5),
                },
              })}
            >
              + New Project
            </Button>
          </Box>

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
                gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
                gap: 3,
              }}
            >
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
          onEdit={() => {
            if (menuProjectId) {
              handleEditProject(menuProjectId);
            }
            handleMenuClose();
          }}
          onDelete={() => handleDeleteClick(menuProjectId)}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onCancel={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title="Delete Project"
          message={`Are you sure you want to delete "${
            projects.find((p) => p.id === projectToDelete)?.name ||
            "this project"
          }"? This action cannot be undone.`}
        />
      </Page>

      {/* Create Project Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleCloseDrawer}
        sx={{
          zIndex: 1500, // Higher than sidebar (1400)
          "& .MuiBackdrop-root": {
            zIndex: 1499, // Backdrop should be just below drawer
          },
        }}
        ModalProps={{
          keepMounted: false,
          disableScrollLock: true,
        }}
        PaperProps={{
          sx: (theme) => ({
            width: { xs: "100%", sm: "420px" },
            backgroundColor:
              theme.palette.mode === "dark"
                ? "#14171A !important"
                : theme.palette.background.paper,
            borderLeft: "1px solid rgba(255, 255, 255, 0.05)",
            zIndex: 1500,
            "&.MuiPaper-root": {
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "#14171A !important"
                  : theme.palette.background.paper,
            },
          }),
        }}
      >
        <Box
          sx={(theme) => ({
            p: 3,
            backgroundColor:
              theme.palette.mode === "dark"
                ? "#14171A"
                : theme.palette.background.paper,
            minHeight: "100%",
          })}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 3,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {editingProjectId ? "Edit Project" : "Create New Project"}
            </Typography>
            <IconButton
              size="small"
              onClick={handleCloseDrawer}
              sx={{
                color: "text.secondary",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Form */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <SettingContainer sx={{ borderBottom: "none", padding: 0 }}>
              <SettingLabel>Project Title</SettingLabel>
              <TextField
                id="project-title"
                name="project-title"
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                placeholder="Enter project title"
                fullWidth
                size="small"
                variant="outlined"
                sx={textFieldStyles}
              />
            </SettingContainer>

            <SettingContainer sx={{ borderBottom: "none", padding: 0 }}>
              <SettingLabel>Project Description</SettingLabel>
              <TextField
                id="project-description"
                name="project-description"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                placeholder="Enter project description"
                fullWidth
                multiline
                rows={4}
                size="small"
                variant="outlined"
                sx={textFieldStyles}
              />
            </SettingContainer>

            <SettingContainer sx={{ borderBottom: "none", padding: 0 }}>
              <SettingLabel>Rendering Engine</SettingLabel>
              <Select
                id="engine-select"
                value={newProjectEngine}
                onChange={(e) => setNewProjectEngine(e.target.value)}
                fullWidth
                size="small"
                variant="outlined"
                sx={(theme) => ({
                  ...((typeof selectStyles === "function"
                    ? selectStyles(theme)
                    : selectStyles) as Record<string, any>),
                  "& .MuiSelect-select": {
                    cursor: "pointer",
                  },
                  "& input": {
                    cursor: "pointer",
                  },
                })}
                MenuProps={{
                  disablePortal: true,
                  disableScrollLock: true,
                  disableAutoFocus: true,
                  disableEnforceFocus: true,
                  disableRestoreFocus: true,
                  BackdropProps: {
                    invisible: true,
                    sx: {
                      pointerEvents: "auto",
                      cursor: "default",
                    },
                  },
                  PaperProps: {
                    sx: (theme) => ({
                      maxHeight: 300,
                      zIndex: 1600, // Higher than drawer (1500)
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? "#14171A"
                          : theme.palette.background.paper,
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "4px",
                      mt: 0.5,
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                    }),
                  },
                  anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "left",
                  },
                  transformOrigin: {
                    vertical: "top",
                    horizontal: "left",
                  },
                }}
              >
                <MenuItem value="three" sx={menuItemStyles}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography>Three.js</Typography>
                    <Typography variant="caption" color="text.secondary">
                      - 3D scene with custom models and effects
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="cesium" sx={menuItemStyles}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography>Cesium</Typography>
                    <Typography variant="caption" color="text.secondary">
                      - 3D globe with terrain and geospatial data
                    </Typography>
                  </Box>
                </MenuItem>
              </Select>
            </SettingContainer>

            {/* Actions */}
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                onClick={handleCloseDrawer}
                fullWidth
                disabled={savingProject}
                sx={(theme) => ({
                  borderRadius: `${theme.shape.borderRadius}px`,
                  textTransform: "none",
                })}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSaveProject}
                fullWidth
                disabled={!newProjectTitle.trim() || savingProject}
                sx={(theme) => ({
                  borderRadius: `${theme.shape.borderRadius}px`,
                  textTransform: "none",
                  fontWeight: 500,
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "#161B20"
                      : theme.palette.background.paper,
                  color: theme.palette.primary.main,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                  "&:hover": {
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? "#1a1f26"
                        : alpha(theme.palette.primary.main, 0.05),
                    borderColor: alpha(theme.palette.primary.main, 0.5),
                  },
                  "&:disabled": {
                    opacity: 0.5,
                  },
                })}
              >
                {savingProject
                  ? editingProjectId
                    ? "Saving..."
                    : "Creating..."
                  : editingProjectId
                    ? "Save Changes"
                    : "Create Project"}
              </Button>
            </Box>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default ProjectsPage;
