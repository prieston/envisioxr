"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Drawer,
  IconButton,
  AppBar,
  Toolbar,
  useMediaQuery,
  useTheme,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import useSceneStore from "@/hooks/useSceneStore";
import LogoHeader from "@/components/LogoHeader";
import InfoIcon from "@mui/icons-material/Info";
import CloseIcon from "@mui/icons-material/Close";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

// Dynamically import PreviewScene with SSR disabled.
const PreviewScene = dynamic(() => import("@/components/PreviewScene"), {
  ssr: false,
});

// Constants for mobile layout dimensions.
const BOTTOM_BAR_HEIGHT = 64;
const TOP_APPBAR_HEIGHT = 56;

const PublishedScenePage = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Destructure necessary state and actions from the store.
  const {
    previewMode,
    setPreviewMode,
    setObservationPoints,
    selectObservationPoint,
    observationPoints,
    previewIndex,
    selectedObservation,
    nextObservation,
    prevObservation,
  } = useSceneStore();

  // Enable preview mode on mount.
  useEffect(() => {
    setPreviewMode(true);
  }, [setPreviewMode]);

  // Fetch project data.
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch project data");
        const data = await res.json();
        if (!data.project || !data.project.isPublished) {
          throw new Error("Project not published");
        }
        setProject(data.project);
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  // When project data loads, update the store's observation points and select the first one.
  useEffect(() => {
    if (
      project &&
      project.sceneData &&
      project.sceneData.observationPoints &&
      project.sceneData.observationPoints.length > 0
    ) {
      setObservationPoints(project.sceneData.observationPoints);
      selectObservationPoint(project.sceneData.observationPoints[0].id);
    }
  }, [project, setObservationPoints, selectObservationPoint]);

  // When previewIndex changes, update the selected observation.
  useEffect(() => {
    if (
      observationPoints &&
      observationPoints.length > 0 &&
      previewIndex >= 0 &&
      previewIndex < observationPoints.length
    ) {
      selectObservationPoint(observationPoints[previewIndex].id);
    }
  }, [previewIndex, observationPoints, selectObservationPoint]);

  // Use the selected observation for display.
  const currentObservation =
    selectedObservation ||
    (observationPoints && observationPoints.length > 0
      ? observationPoints[0]
      : null);

  if (loading) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!project) {
    return (
      <Box sx={{ p: 5 }}>
        <Typography variant="h6">
          Project not found or not published.
        </Typography>
      </Box>
    );
  }

  // For mobile, adjust the scene height so it doesn't render under the bottom bar.
  const sceneContainerHeight = isMobile
    ? `calc(100vh - ${TOP_APPBAR_HEIGHT + BOTTOM_BAR_HEIGHT}px)`
    : "100%";

  // Mobile details to display in the bottom drawer.
  const mobileDetails = (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {project.title}
      </Typography>
      <Typography variant="body1" gutterBottom>
        {project.description}
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1">
          {currentObservation?.title || "Untitled"}
        </Typography>
        <Typography variant="body2">
          {currentObservation?.description || "No description provided."}
        </Typography>
      </Box>
      {/* Mobile toggle for free navigation / preview mode */}
      <Box sx={{ mt: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={previewMode}
              onChange={(e) => setPreviewMode(e.target.checked)}
              color="primary"
            />
          }
          label={previewMode ? "Preview Mode" : "Free Navigation"}
        />
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <>
        {/* Mobile Top AppBar */}
        <AppBar
          position="fixed"
          sx={{
            top: 0,
            backgroundColor: theme.palette.background.paper,
            backgroundImage: "none",
            boxShadow: "none",
            color: theme.palette.text.primary,
          }}
        >
          <Toolbar>
            <LogoHeader />
          </Toolbar>
        </AppBar>

        {/* Scene Container */}
        <Box
          sx={{
            mt: `${TOP_APPBAR_HEIGHT}px`,
            height: sceneContainerHeight,
            position: "relative",
          }}
        >
          <PreviewScene
            initialSceneData={project.sceneData}
            renderObservationPoints={false}
          />
        </Box>

        {/* Mobile Bottom Navigation Bar */}
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            height: `${BOTTOM_BAR_HEIGHT}px`,
            backgroundColor: theme.palette.background.paper,
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            boxShadow: theme.shadows[4],
            zIndex: 1300,
          }}
        >
          <IconButton color="inherit" onClick={() => setDrawerOpen(true)}>
            <InfoIcon />
          </IconButton>
          <IconButton
            onClick={prevObservation}
            color="inherit"
            disabled={previewIndex === 0}
          >
            <NavigateBeforeIcon />
          </IconButton>
          <IconButton
            onClick={nextObservation}
            color="inherit"
            disabled={
              !observationPoints || previewIndex >= observationPoints.length - 1
            }
          >
            <NavigateNextIcon />
          </IconButton>
        </Box>

        {/* Bottom Drawer for Info */}
        <Drawer
          anchor="bottom"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          PaperProps={{
            sx: { boxShadow: "none", mb: `${BOTTOM_BAR_HEIGHT}px` },
          }}
          ModalProps={{
            BackdropProps: { invisible: true },
          }}
        >
          {mobileDetails}
        </Drawer>
      </>
    );
  } else {
    // Desktop view: Left sidebar with details and free navigation toggle.
    return (
      <Box sx={{ display: "flex", height: "100vh" }}>
        <Box
          sx={{
            width: "300px",
            backgroundColor: theme.palette.background.paper,
            p: 2,
            borderRight: "1px solid rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <LogoHeader sx={{ mb: 2 }} />
          <FormControlLabel
            control={
              <Switch
                checked={previewMode}
                onChange={(e) => setPreviewMode(e.target.checked)}
                color="primary"
              />
            }
            label={previewMode ? "Preview Mode" : "Free Navigation"}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              sx={{ flex: 1 }}
              variant="outlined"
              onClick={prevObservation}
              disabled={previewIndex === 0}
            >
              Previous
            </Button>
            <Button
              sx={{ flex: 1 }}
              variant="outlined"
              onClick={nextObservation}
              disabled={
                !observationPoints ||
                previewIndex >= observationPoints.length - 1
              }
            >
              Next
            </Button>
          </Box>
          <Box sx={{ overflow: "auto", height: "100%" }}>
            <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
              {project.title}
            </Typography>
            <Typography variant="body1" gutterBottom>
              {project.description}
            </Typography>
            {/* add an horizontal separation line bellow from mui */}
            <Box
              sx={{
                borderBottom: "1px solid rgba(159, 159, 159, 0.1)",
                mb: 2,
              }}
            />

            <Box sx={{ mt: 1 }}>
              {currentObservation ? (
                <>
                  <Typography variant="h6" gutterBottom>
                    {currentObservation.title || "Untitled"}
                  </Typography>
                  <Typography variant="body2">
                    {currentObservation.description ||
                      "No description provided."}
                  </Typography>
                </>
              ) : (
                <Typography variant="body2">
                  No observation point selected.
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
        <Box sx={{ flexGrow: 1, position: "relative" }}>
          <PreviewScene
            initialSceneData={project.sceneData}
            renderObservationPoints={false}
          />
        </Box>
      </Box>
    );
  }
};

export default PublishedScenePage;
