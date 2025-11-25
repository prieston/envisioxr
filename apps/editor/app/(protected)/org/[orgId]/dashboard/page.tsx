"use client";

import React, { useState, useEffect } from "react";
import { Grid } from "@mui/material";
import {
  Page,
  PageHeader,
  PageDescription,
  PageContent,
  formatTimeAgo,
} from "@klorad/ui";
import {
  AnimatedBackground,
  GlowingContainer,
  GlowingSpan,
} from "@/app/components/Builder/AdminLayout.styles";
import useProjects from "@/app/hooks/useProjects";
import useModels from "@/app/hooks/useModels";
import useActivity from "@/app/hooks/useActivity";
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
  const { models, loadingModels } = useModels({ assetType: "model" });
  const { models: tilesets, loadingModels: loadingTilesets } = useModels({
    assetType: "cesiumIonAsset",
  });
  const { activities, loadingActivity } = useActivity({ limit: 10 });
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    projects: 0,
    models: 0,
    sensors: 0,
    tilesets: 0,
    storageUsed: "0 GB",
  });
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  useEffect(() => {
    if (!loadingProjects && !loadingModels && !loadingTilesets) {
      // Calculate storage from assets
      let totalBytes = 0;
      [...models, ...tilesets].forEach((asset) => {
        // For regular models: use fileSize column
        if (asset.fileSize) {
          const size =
            typeof asset.fileSize === "bigint"
              ? Number(asset.fileSize)
              : asset.fileSize;
          totalBytes += size;
        }
        // For Cesium Ion assets: check metadata.bytes
        else if (
          asset.assetType === "cesiumIonAsset" &&
          asset.metadata &&
          typeof asset.metadata === "object"
        ) {
          const metadata = asset.metadata as Record<string, unknown>;
          if (typeof metadata.bytes === "number") {
            totalBytes += metadata.bytes;
          }
        }
      });

      // Format storage
      const formatStorage = (bytes: number): string => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
      };

      const storageUsed = formatStorage(totalBytes);

      setMetrics({
        projects: projects.length,
        models: models.length,
        sensors: 0, // Always 0 - coming soon
        tilesets: tilesets.length,
        storageUsed,
      });
      setLoadingMetrics(false);
    }
  }, [projects, models, tilesets, loadingProjects, loadingModels, loadingTilesets]);

  // Format activities for RecentActivity component
  const recentActivity = activities.map((activity) => {
    // Map entity types and actions to icons
    let icon: React.ReactNode;
    if (activity.entityType === "MODEL" || activity.entityType === "GEOSPATIAL_ASSET") {
      icon = <CloudUploadIcon />;
    } else if (activity.entityType === "SENSOR") {
      icon = <SensorsIcon />;
    } else if (activity.entityType === "PROJECT") {
      icon = <MapIcon />;
    } else if (activity.entityType === "USER") {
      icon = <PersonAddIcon />;
    } else {
      icon = <CloudUploadIcon />;
    }

    // Use message if available, otherwise construct from entityType + action
    const title =
      activity.message ||
      `${activity.entityType} ${activity.action.toLowerCase()}`;

    // Extract description from metadata or project title
    const description =
      activity.project?.title ||
      (activity.metadata && typeof activity.metadata === "object"
        ? (activity.metadata as { assetName?: string; projectTitle?: string })
            .assetName ||
          (activity.metadata as { assetName?: string; projectTitle?: string })
            .projectTitle ||
          ""
        : "");

    return {
      icon,
      title,
      description,
      timestamp: formatTimeAgo(new Date(activity.createdAt)),
    };
  });

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
              <RecentActivity
                activities={recentActivity}
                loading={loadingActivity}
              />
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
