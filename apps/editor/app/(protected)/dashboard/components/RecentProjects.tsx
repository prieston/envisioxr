"use client";

import React, { useState } from "react";
import { Box, Grid, Typography, Button, CircularProgress } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageCard, DashboardProjectCard, DashboardOptionsMenu } from "@envisio/ui";
import AddIcon from "@mui/icons-material/Add";

interface Project {
  id: string;
  title: string;
  description?: string | null;
  engine?: string;
  thumbnail?: string | null;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

interface RecentProjectsProps {
  projects: Project[];
  loading: boolean;
}

export const RecentProjects: React.FC<RecentProjectsProps> = ({
  projects,
  loading,
}) => {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const openMenu = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, _projectId: string) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleGoToProject = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <PageCard>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Recent Projects
          </Typography>
          <Button
            component={Link}
            href="/projects"
            size="small"
            sx={{ textTransform: "none" }}
          >
            View All
          </Button>
        </Box>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : projects.length === 0 ? (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              No projects yet
            </Typography>
            <Button
              component={Link}
              href="/projects/create"
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
            >
              Create Your First Project
            </Button>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {projects.slice(0, 4).map((project) => (
              <Grid item xs={6} key={project.id}>
                <DashboardProjectCard
                  project={project}
                  onGoToBuilder={() => handleGoToProject(project.id)}
                  onMenuOpen={(event) => handleMenuOpen(event, project.id)}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </PageCard>

      {/* Options Menu */}
      <DashboardOptionsMenu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleMenuClose}
        onEdit={() => {
          // Navigate to edit if needed
          handleMenuClose();
        }}
        onDelete={() => {
          // Handle delete if needed
          handleMenuClose();
        }}
      />
    </Box>
  );
};

