"use client";

import React from "react";
import { Box, Grid, Typography, Chip, alpha } from "@mui/material";
import { useRouter } from "next/navigation";
import { PageCard } from "@klorad/ui";
import AddIcon from "@mui/icons-material/Add";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import SensorsIcon from "@mui/icons-material/Sensors";
import MapIcon from "@mui/icons-material/Map";
import { useOrgId } from "@/app/hooks/useOrgId";

export const QuickActions: React.FC = () => {
  const router = useRouter();
  const orgId = useOrgId();

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

  const disabledButtonStyles = {
    ...actionButtonStyles,
    cursor: "not-allowed",
    opacity: 0.6,
    "&:hover": {
      backgroundColor: "#161B20",
      borderColor: "#6b9cd84a",
    },
  };

  const handleNewProject = () => {
    if (orgId) {
      router.push(`/org/${orgId}/projects?create=true`);
    }
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
            <Box onClick={handleNewProject} sx={actionButtonStyles}>
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
            <Box onClick={() => orgId && router.push(`/org/${orgId}/library/models?upload=true`)} sx={actionButtonStyles}>
              <UploadFileIcon sx={{ fontSize: 20, color: "#6B9CD8 !important" }} />
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#6B9CD8 !important",
                }}
              >
                Upload Model
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ position: "relative" }}>
              <Box sx={disabledButtonStyles}>
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
              <Chip
                label="Coming Soon"
                size="small"
                sx={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  height: "20px",
                  fontSize: "0.7rem",
                  fontWeight: 500,
                  backgroundColor: alpha("#6366f1", 0.15),
                  color: "#6366f1",
                  border: "1px solid",
                  borderColor: alpha("#6366f1", 0.4),
                  "& .MuiChip-label": {
                    px: 1,
                  },
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box onClick={() => orgId && router.push(`/org/${orgId}/library/geospatial?upload=true`)} sx={actionButtonStyles}>
              <MapIcon sx={{ fontSize: 20, color: "#6B9CD8 !important" }} />
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#6B9CD8 !important",
                }}
              >
                Upload Geospatial Asset
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </PageCard>
    </Box>
  );
};

