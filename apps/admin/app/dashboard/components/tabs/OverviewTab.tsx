"use client";

import { Grid } from "@mui/material";
import {
  MetricCard,
  PeopleIcon,
  BusinessIcon,
  FolderIcon,
  StorageIcon,
} from "@klorad/ui";
import useSWR from "swr";
import { Box, CircularProgress, Typography } from "@mui/material";

interface OverviewStats {
  overview: {
    totalUsers: number;
    totalOrganizations: number;
    totalProjects: number;
    totalAssets: number;
    totalActivities: number;
    totalStorageGB: number;
  };
}

const formatStorage = (gb: number): string => {
  if (gb < 0.001) return "0 MB";
  if (gb < 1) return `${(gb * 1024).toFixed(2)} MB`;
  if (gb < 1024) return `${gb.toFixed(2)} GB`;
  return `${(gb / 1024).toFixed(2)} TB`;
};

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch overview stats");
  return res.json();
};

export function OverviewTab() {
  const { data, error, isLoading } = useSWR<OverviewStats>(
    "/api/stats?section=overview",
    fetcher
  );

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">Failed to load overview data</Typography>
      </Box>
    );
  }

  if (!data?.overview) return null;

  return (
    <Grid container spacing={2} sx={{ mb: 4 }}>
      <Grid item xs={6} sm={4} md={3}>
        <MetricCard
          label="Total Users"
          value={data.overview.totalUsers.toString()}
          icon={<PeopleIcon sx={{ fontSize: 20 }} />}
        />
      </Grid>
      <Grid item xs={6} sm={4} md={3}>
        <MetricCard
          label="Organizations"
          value={data.overview.totalOrganizations.toString()}
          icon={<BusinessIcon sx={{ fontSize: 20 }} />}
        />
      </Grid>
      <Grid item xs={6} sm={4} md={3}>
        <MetricCard
          label="Projects"
          value={data.overview.totalProjects.toString()}
          icon={<FolderIcon sx={{ fontSize: 20 }} />}
        />
      </Grid>
      <Grid item xs={6} sm={4} md={3}>
        <MetricCard
          label="Storage Used"
          value={formatStorage(data.overview.totalStorageGB)}
          icon={<StorageIcon sx={{ fontSize: 20 }} />}
        />
      </Grid>
    </Grid>
  );
}

