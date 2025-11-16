"use client";

import React from "react";
import { Box, Grid, Typography, Button, CircularProgress } from "@mui/material";
import Link from "next/link";
import { PageCard } from "@envisio/ui";
import FolderIcon from "@mui/icons-material/Folder";
import AddIcon from "@mui/icons-material/Add";

interface Project {
  id: string;
  title: string;
  createdAt: string | Date;
}

interface RecentProjectsProps {
  projects: Project[];
  loading: boolean;
}

export const RecentProjects: React.FC<RecentProjectsProps> = ({
  projects,
  loading,
}) => {
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
                <Box
                  component={Link}
                  href={`/projects/${project.id}/builder`}
                  sx={{
                    display: "block",
                    p: 2,
                    borderRadius: "4px",
                    backgroundColor: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      borderColor: "rgba(255, 255, 255, 0.1)",
                    },
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      height: "120px",
                      borderRadius: "4px",
                      backgroundColor: "rgba(107, 156, 216, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 1.5,
                    }}
                  >
                    <FolderIcon sx={{ fontSize: 48, color: "#6B9CD8" }} />
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                    {project.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255, 255, 255, 0.5)",
                      fontSize: "0.75rem",
                    }}
                  >
                    {new Date(project.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </PageCard>
    </Box>
  );
};

