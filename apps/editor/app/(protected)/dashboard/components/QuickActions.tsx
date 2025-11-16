"use client";

import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import Link from "next/link";
import { PageCard } from "@envisio/ui";
import AddIcon from "@mui/icons-material/Add";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import SensorsIcon from "@mui/icons-material/Sensors";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";

export const QuickActions: React.FC = () => {
  const actionButtonStyles = {
    height: "76px",
    width: "100%",
    border: "1px solid #6b9cd84a",
    backgroundColor: "#161B20",
    borderRadius: "4px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer",
    transition: "all 0.15s ease",
    textDecoration: "none",
    color: "#6B9CD8",
    "&:hover": {
      backgroundColor: "rgba(95, 136, 199, 0.08)",
      borderColor: "#6B9CD8",
    },
    "& *": {
      color: "inherit",
    },
  };

  return (
    <Box sx={{ mb: 3 }}>
      <PageCard padding={3}>
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            fontWeight: 600,
            color: "#FFFFFF",
            fontSize: "18px",
          }}
        >
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Box component={Link} href="/projects/create" sx={actionButtonStyles}>
              <AddIcon sx={{ fontSize: 20, color: "#6B9CD8 !important" }} />
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#6B9CD8 !important",
                }}
              >
                New Project
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box component={Link} href="/library/models" sx={actionButtonStyles}>
              <UploadFileIcon sx={{ fontSize: 20, color: "#6B9CD8 !important" }} />
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#6B9CD8 !important",
                }}
              >
                Upload Asset
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box component={Link} href="/library/sensors" sx={actionButtonStyles}>
              <SensorsIcon sx={{ fontSize: 20, color: "#6B9CD8 !important" }} />
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#6B9CD8 !important",
                }}
              >
                Add Sensor
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box component={Link} href="/library" sx={actionButtonStyles}>
              <LibraryBooksIcon sx={{ fontSize: 20, color: "#6B9CD8 !important" }} />
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#6B9CD8 !important",
                }}
              >
                Open Library
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </PageCard>
    </Box>
  );
};

