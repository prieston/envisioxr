"use client";

import React, { useState, useEffect } from "react";
import { Grid } from "@mui/material";
import {
  Page,
  PageHeader,
  PageDescription,
  PageContent,
} from "@envisio/ui";
import {
  AnimatedBackground,
  GlowingContainer,
  GlowingSpan,
} from "@/app/components/Builder/AdminLayout.styles";
import useProjects from "@/app/hooks/useProjects";
import useModels from "@/app/hooks/useModels";
import SensorsIcon from "@mui/icons-material/Sensors";
import MapIcon from "@mui/icons-material/Map";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { KeyMetrics } from "./components/KeyMetrics";
import { QuickActions } from "./components/QuickActions";
import { RecentActivity } from "./components/RecentActivity";
import { UsageSummary } from "./components/UsageSummary";
import { RecentProjects } from "./components/RecentProjects";
import { Changelog } from "./components/Changelog";

interface DashboardMetrics {
  projects: number;
  models: number;
  sensors: number;
  tilesets: number;
  storageUsed: string;
}

const DashboardPage = () => {
  const { projects, loadingProjects } = useProjects();
  const { models, loadingModels } = useModels();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    projects: 0,
    models: 0,
    sensors: 0,
    tilesets: 0,
    storageUsed: "0 GB",
  });
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  useEffect(() => {
    if (!loadingProjects && !loadingModels) {
      // Calculate storage (mock for now - would need actual storage calculation)
      const storageUsed = "4.2 GB"; // TODO: Calculate from actual assets

      setMetrics({
        projects: projects.length,
        models: models.length,
        sensors: 14, // TODO: Fetch from sensors API
        tilesets: 3, // TODO: Fetch from geospatial API
        storageUsed,
      });
      setLoadingMetrics(false);
    }
  }, [projects, models, loadingProjects, loadingModels]);

  // Mock recent activity - in production, fetch from activity API
  const recentActivity = [
    {
      icon: <CloudUploadIcon />,
      title: "3 models uploaded",
      description: "Added to Project 'Downtown Development'",
      timestamp: "2 hours ago",
    },
    {
      icon: <SensorsIcon />,
      title: "Sensor PTZ-4 updated",
      description: "FOV parameter changed to 120°",
      timestamp: "5 hours ago",
    },
    {
      icon: <MapIcon />,
      title: "Geospatial tileset uploaded",
      description: "Downtown area terrain data",
      timestamp: "1 day ago",
    },
    {
      icon: <PersonAddIcon />,
      title: "New team member",
      description: "Alex joined the organization",
      timestamp: "2 days ago",
    },
  ];

  // Mock announcements
  const announcements = [
    {
      title: "Viewshed 2.0 Released",
    },
    {
      title: "Cesium Terrain Clipping",
    },
    {
      title: "Performance Improvements",
    },
  ];

  const recentProjects = projects.slice(0, 6);

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
        <PageHeader title="Dashboard" />
        <PageDescription>
          Overview of your projects, assets, activity, and platform updates
        </PageDescription>

        <PageContent maxWidth="6xl">
          {/* Row 1: Key Metrics */}
          <KeyMetrics metrics={metrics} loading={loadingMetrics} />

          {/* Row 2: Quick Actions */}
          <QuickActions />

          {/* Two Column Layout: Left (Activity + Usage) | Right (Projects + Changelog) */}
          <Grid container spacing={3}>
            {/* Left Column */}
            <Grid item xs={12} md={5}>
              <RecentActivity activities={recentActivity} />
              <UsageSummary storageUsed={metrics.storageUsed} />
            </Grid>

            {/* Right Column */}
            <Grid item xs={12} md={7}>
              <RecentProjects projects={recentProjects} loading={loadingProjects} />
              <Changelog announcements={announcements} />
            </Grid>
          </Grid>
        </PageContent>
      </Page>
    </>
  );
};

export default DashboardPage;
