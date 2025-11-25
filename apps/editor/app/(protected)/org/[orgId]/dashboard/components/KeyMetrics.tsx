"use client";

import React from "react";
import { Grid, Box, Chip, alpha } from "@mui/material";
import { MetricCard } from "@klorad/ui";
import {
  FolderIcon,
  ThreeDRotationIcon,
  SensorsIcon,
  MapIcon,
  StorageIcon,
} from "@klorad/ui";

interface DashboardMetrics {
  projects: number;
  models: number;
  sensors: number;
  tilesets: number;
  storageUsed: string;
}

interface KeyMetricsProps {
  metrics: DashboardMetrics;
  loading: boolean;
}

export const KeyMetrics: React.FC<KeyMetricsProps> = ({ metrics, loading }) => {
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={6} sm={4} md={2.4}>
        <MetricCard
          label="Projects"
          value={loading ? "..." : metrics.projects.toString()}
          icon={<FolderIcon sx={{ fontSize: 20 }} />}
        />
      </Grid>
      <Grid item xs={6} sm={4} md={2.4}>
        <MetricCard
          label="Models"
          value={loading ? "..." : metrics.models.toString()}
          icon={<ThreeDRotationIcon sx={{ fontSize: 20 }} />}
        />
      </Grid>
      <Grid item xs={6} sm={4} md={2.4}>
        <Box sx={{ position: "relative" }}>
          <MetricCard
            label="Sensors"
            value={loading ? "..." : metrics.sensors.toString()}
            icon={<SensorsIcon sx={{ fontSize: 20 }} />}
          />
          <Chip
            label="Coming Soon"
            size="small"
            sx={{
              position: "absolute",
              top: 4,
              right: 4,
              height: "18px",
              fontSize: "0.65rem",
              fontWeight: 500,
              backgroundColor: alpha("#6366f1", 0.15),
              color: "#6366f1",
              border: "1px solid",
              borderColor: alpha("#6366f1", 0.4),
              "& .MuiChip-label": {
                px: 0.75,
                py: 0,
              },
            }}
          />
        </Box>
      </Grid>
      <Grid item xs={6} sm={4} md={2.4}>
        <MetricCard
          label="Geospatial Assets"
          value={loading ? "..." : metrics.tilesets.toString()}
          icon={<MapIcon sx={{ fontSize: 20 }} />}
        />
      </Grid>
      <Grid item xs={6} sm={4} md={2.4}>
        <MetricCard
          label="Storage Used"
          value={loading ? "..." : metrics.storageUsed}
          icon={<StorageIcon sx={{ fontSize: 20 }} />}
        />
      </Grid>
    </Grid>
  );
};

