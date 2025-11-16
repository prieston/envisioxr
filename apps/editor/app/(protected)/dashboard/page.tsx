"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, Grid, Button, CircularProgress } from "@mui/material";
import {
  Page,
  PageHeader,
  PageDescription,
  PageContent,
  PageCard,
  MetricCard,
  ActivityItem,
} from "@envisio/ui";
import {
  AnimatedBackground,
  GlowingContainer,
  GlowingSpan,
} from "@/app/components/Builder/AdminLayout.styles";
import Link from "next/link";
import useProjects from "../../hooks/useProjects";
import FolderIcon from "@mui/icons-material/Folder";
import ThreeDRotationIcon from "@mui/icons-material/ThreeDRotation";
import SensorsIcon from "@mui/icons-material/Sensors";
import MapIcon from "@mui/icons-material/Map";
import StorageIcon from "@mui/icons-material/Storage";
import AddIcon from "@mui/icons-material/Add";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

interface DashboardMetrics {
  projects: number;
  models: number;
  sensors: number;
  tilesets: number;
  storageUsed: string;
}

const DashboardPage = () => {
  const { projects, loadingProjects } = useProjects();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    projects: 0,
    models: 0,
    sensors: 0,
    tilesets: 0,
    storageUsed: "0 GB",
  });
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Fetch models count
        const modelsRes = await fetch("/api/models", {
          credentials: "include",
        });
        const modelsData = await modelsRes.json();
        const modelsCount = (modelsData.assets || []).length;

        // Calculate storage (mock for now - would need actual storage calculation)
        const storageUsed = "4.2 GB"; // TODO: Calculate from actual assets

        setMetrics({
          projects: projects.length,
          models: modelsCount,
          sensors: 14, // TODO: Fetch from sensors API
          tilesets: 3, // TODO: Fetch from geospatial API
          storageUsed,
        });
      } catch (error) {
        console.error("Error fetching metrics:", error);
      } finally {
        setLoadingMetrics(false);
      }
    };

    if (!loadingProjects) {
      fetchMetrics();
    }
  }, [projects, loadingProjects]);

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
      icon: <CheckCircleIcon sx={{ color: "#22c55e" }} />,
      title: "Viewshed 2.0 Released",
      description: "Enhanced visibility analysis with terrain occlusion",
      date: "2024-01-15",
    },
    {
      icon: <CheckCircleIcon sx={{ color: "#22c55e" }} />,
      title: "Cesium Terrain Clipping",
      description: "New feature for precise terrain manipulation",
      date: "2024-01-10",
    },
    {
      icon: <CheckCircleIcon sx={{ color: "#22c55e" }} />,
      title: "Performance Improvements",
      description: "50% faster rendering for large scenes",
      date: "2024-01-05",
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
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={4} md={2.4}>
              <MetricCard
                label="Projects"
                value={loadingMetrics ? "..." : metrics.projects}
                icon={<FolderIcon sx={{ fontSize: 20 }} />}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={2.4}>
              <MetricCard
                label="Models"
                value={loadingMetrics ? "..." : metrics.models}
                icon={<ThreeDRotationIcon sx={{ fontSize: 20 }} />}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={2.4}>
              <MetricCard
                label="Sensors"
                value={loadingMetrics ? "..." : metrics.sensors}
                icon={<SensorsIcon sx={{ fontSize: 20 }} />}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={2.4}>
              <MetricCard
                label="Tilesets"
                value={loadingMetrics ? "..." : metrics.tilesets}
                icon={<MapIcon sx={{ fontSize: 20 }} />}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={2.4}>
              <MetricCard
                label="Storage Used"
                value={loadingMetrics ? "..." : metrics.storageUsed}
                icon={<StorageIcon sx={{ fontSize: 20 }} />}
              />
            </Grid>
          </Grid>

          {/* Row 2: Quick Actions - Dashboard-scaled Builder Style */}
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
                  <Box
                    component={Link}
                    href="/projects/create"
                    sx={{
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
                    }}
                  >
                    <AddIcon
                      sx={{ fontSize: 20, color: "#6B9CD8 !important" }}
                    />
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
                  <Box
                    component={Link}
                    href="/library/models"
                    sx={{
                      height: "76px",
                      width: "100%",
                      border: "1px solid #6B9CD8",
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
                    }}
                  >
                    <UploadFileIcon
                      sx={{ fontSize: 20, color: "#6B9CD8 !important" }}
                    />
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
                  <Box
                    component={Link}
                    href="/library/sensors"
                    sx={{
                      height: "76px",
                      width: "100%",
                      border: "1px solid #6B9CD8",
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
                    }}
                  >
                    <SensorsIcon
                      sx={{ fontSize: 20, color: "#6B9CD8 !important" }}
                    />
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
                  <Box
                    component={Link}
                    href="/library"
                    sx={{
                      height: "76px",
                      width: "100%",
                      border: "1px solid #6B9CD8",
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
                    }}
                  >
                    <LibraryBooksIcon
                      sx={{ fontSize: 20, color: "#6B9CD8 !important" }}
                    />
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

          {/* Two Column Layout: Left (Activity + Usage) | Right (Projects + Activity + Changelog) */}
          <Grid container spacing={3}>
            {/* Left Column */}
            <Grid item xs={12} md={5}>
              {/* Recent Activity */}
              <Box sx={{ mb: 3 }}>
                <PageCard>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Recent Activity
                </Typography>
                <Box
                  sx={{
                    maxHeight: "300px",
                    overflowY: "auto",
                    "&::-webkit-scrollbar": {
                      width: "8px",
                    },
                    "&::-webkit-scrollbar-track": {
                      background: "rgba(107, 156, 216, 0.08)",
                      borderRadius: "4px",
                      margin: "4px 0",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      background: "rgba(107, 156, 216, 0.24)",
                      borderRadius: "4px",
                      border: "2px solid transparent",
                      backgroundClip: "padding-box",
                      transition: "background 0.2s ease",
                      "&:hover": {
                        background: "rgba(107, 156, 216, 0.38)",
                        backgroundClip: "padding-box",
                      },
                    },
                  }}
                >
                  {recentActivity.map((activity, index) => (
                    <ActivityItem
                      key={index}
                      icon={activity.icon}
                      title={activity.title}
                      description={activity.description}
                      timestamp={activity.timestamp}
                    />
                  ))}
                </Box>
                </PageCard>
              </Box>

              {/* Usage Summary */}
              <Box sx={{ mt: 3 }}>
                <PageCard>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Usage Summary
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box
                        sx={{
                          width: "4px",
                          height: "20px",
                          backgroundColor: "#6B9CD8",
                          borderRadius: "2px",
                        }}
                      />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Storage: {metrics.storageUsed} / 100 GB
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box
                        sx={{
                          width: "4px",
                          height: "20px",
                          backgroundColor: "#6B9CD8",
                          borderRadius: "2px",
                        }}
                      />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          API Calls: 12.4K this month
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box
                        sx={{
                          width: "4px",
                          height: "20px",
                          backgroundColor: "#6B9CD8",
                          borderRadius: "2px",
                        }}
                      />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Renders: 847 this month
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </PageCard>
              </Box>
            </Grid>

            {/* Right Column */}
            <Grid item xs={12} md={7}>
              {/* Recent Projects */}
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
                {loadingProjects ? (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", py: 4 }}
                  >
                    <CircularProgress size={24} />
                  </Box>
                ) : recentProjects.length === 0 ? (
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
                    {recentProjects.slice(0, 4).map((project) => (
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
                            <FolderIcon
                              sx={{ fontSize: 48, color: "#6B9CD8" }}
                            />
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 500, mb: 0.5 }}
                          >
                            {project.name}
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

              {/* Changelog */}
              <Box sx={{ mt: 3 }}>
                <PageCard>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Changelog
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                  >
                    {announcements.map((announcement, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 1.5,
                        }}
                      >
                        <Box
                          sx={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            backgroundColor: "#6B9CD8",
                            mt: 1,
                            flexShrink: 0,
                          }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {announcement.title}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </PageCard>
              </Box>
            </Grid>
          </Grid>
        </PageContent>
      </Page>
    </>
  );
};

export default DashboardPage;
