"use client";

import React from "react";
import { Grid } from "@mui/material";
import { MetricCard } from "@envisio/ui";
import FolderIcon from "@mui/icons-material/Folder";
import ThreeDRotationIcon from "@mui/icons-material/ThreeDRotation";
import SensorsIcon from "@mui/icons-material/Sensors";
import MapIcon from "@mui/icons-material/Map";
import StorageIcon from "@mui/icons-material/Storage";

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
        <MetricCard
          label="Sensors"
          value={loading ? "..." : metrics.sensors.toString()}
          icon={<SensorsIcon sx={{ fontSize: 20 }} />}
        />
      </Grid>
      <Grid item xs={6} sm={4} md={2.4}>
        <MetricCard
          label="Tilesets"
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

