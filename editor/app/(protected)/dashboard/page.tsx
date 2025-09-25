"use client";

import React, { useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import useProjects from "../../hooks/useProjects";
import CreateProjectCard from "@/app/components/Dashboard/CreateProjectCard";
import ProjectCard from "@/app/components/Dashboard/ProjectCard";
import OptionsMenu from "@/app/components/Dashboard/OptionsMenu";
import DeleteConfirmationDialog from "@/app/components/Dashboard/DeleteConfirmationDialog";
import HelpPopup from "@/app/components/Dashboard/HelpPopup";
import AdminAppBar from "@/app/components/AppBar/AdminAppBar";

// Styled components for animated background
const AnimatedBackground = styled(Box)(() => ({
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  zIndex: -1,
  overflow: "hidden",
  background: "transparent",
}));

const GlowingContainer = styled(Box)(() => ({
  position: "relative",
  transformOrigin: "right",
  animation: "colorChange 5s linear infinite",
  "&:nth-of-type(even)": {
    transformOrigin: "left",
  },
  "@keyframes colorChange": {
    "0%": {
      filter: "hue-rotate(0deg)",
      transform: "rotate(0deg)",
    },
    "100%": {
      filter: "hue-rotate(360deg)",
      transform: "rotate(360deg)",
    },
  },
}));

const GlowingSpan = styled(Box)<{ index: number }>(({ index }) => ({
  position: "absolute",
  top: `calc(80px * ${index})`,
  left: `calc(80px * ${index})`,
  bottom: `calc(80px * ${index})`,
  right: `calc(80px * ${index})`,
  "&::before": {
    content: '""',
    position: "absolute",
    top: "50%",
    left: "-8px",
    width: "15px",
    height: "15px",
    background: "rgba(255, 255, 255, 0.1)",
    borderRadius: "50%",
    boxShadow:
      "0 0 20px rgba(255, 255, 255, 0.05), " +
      "0 0 40px rgba(255, 255, 255, 0.03), " +
      "0 0 60px rgba(255, 255, 255, 0.02), " +
      "0 0 80px rgba(255, 255, 255, 0.01), " +
      "0 0 0 8px rgba(255, 255, 255, 0.01)",
  },
  "&:nth-of-type(3n + 1)": {
    animation: "animate 10s alternate infinite",
    "&::before": {
      background: "rgba(255, 255, 255, 0.08)",
      boxShadow:
        "0 0 20px rgba(255, 255, 255, 0.04), " +
        "0 0 40px rgba(255, 255, 255, 0.03), " +
        "0 0 60px rgba(255, 255, 255, 0.02), " +
        "0 0 80px rgba(255, 255, 255, 0.01), " +
        "0 0 0 8px rgba(255, 255, 255, 0.01)",
    },
  },
  "&:nth-of-type(3n + 2)": {
    animation: "animate-reverse 3s alternate infinite",
    "&::before": {
      background: "rgba(255, 255, 255, 0.06)",
      boxShadow:
        "0 0 20px rgba(255, 255, 255, 0.03), " +
        "0 0 40px rgba(255, 255, 255, 0.02), " +
        "0 0 60px rgba(255, 255, 255, 0.01), " +
        "0 0 80px rgba(255, 255, 255, 0.005), " +
        "0 0 0 8px rgba(255, 255, 255, 0.005)",
    },
  },
  "&:nth-of-type(3n + 3)": {
    animation: "animate 8s alternate infinite",
    "&::before": {
      background: "rgba(255, 255, 255, 0.05)",
      boxShadow:
        "0 0 20px rgba(255, 255, 255, 0.02), " +
        "0 0 40px rgba(255, 255, 255, 0.015), " +
        "0 0 60px rgba(255, 255, 255, 0.01), " +
        "0 0 80px rgba(255, 255, 255, 0.005), " +
        "0 0 0 8px rgba(255, 255, 255, 0.005)",
    },
  },
  "@keyframes animate": {
    "0%": {
      transform: "rotate(180deg)",
    },
    "50%": {
      transform: "rotate(0deg)",
    },
    "100%": {
      transform: "rotate(360deg)",
    },
  },
  "@keyframes animate-reverse": {
    "0%": {
      transform: "rotate(360deg)",
    },
    "50%": {
      transform: "rotate(180deg)",
    },
    "100%": {
      transform: "rotate(0deg)",
    },
  },
}));

const DashboardPage = () => {
  const router = useRouter();
  const { projects, setProjects, loadingProjects } = useProjects();
  const [showHelp, setShowHelp] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const handleHelpClick = () => {
    setShowHelp(true);
  };

  const handleCloseHelp = () => {
    setShowHelp(false);
  };

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
      setProjects((prevProjects) =>
        prevProjects.filter((project) => project.id !== menuProjectId)
      );
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  // Render a loader until projects are loaded.
  if (loadingProjects) {
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

      <AdminAppBar
        mode="simple"
        onHelpClick={handleHelpClick}
        showHelpPulse={false}
      />

      <Box
        sx={(theme) => ({
          padding: "120px 16px 40px 16px",
          backgroundColor: "transparent",
          color: theme.palette.text.primary,
          minHeight: "100vh",
          position: "relative",
          zIndex: 1,
        })}
      >
        <HelpPopup open={showHelp} onClose={handleCloseHelp} />

        <Box
          sx={{
            paddingBottom: 2,
          }}
        >
          <Typography variant="h5" sx={{ color: "text.primary" }}>
            Your Projects
          </Typography>
        </Box>

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
