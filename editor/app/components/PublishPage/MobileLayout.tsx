"use client";

import React from "react";
import dynamic from "next/dynamic";
import {
  IconButton,
  Drawer,
  FormControlLabel,
  Switch,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Toolbar from "@mui/material/Toolbar";
import AppBar from "@mui/material/AppBar";
import InfoIcon from "@mui/icons-material/Info";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import LogoHeader from "@/components/AppBar/LogoHeader";

const PreviewScene = dynamic(() => import("@/components/PreviewScene"), {
  ssr: false,
});

// Layout constants
const TOP_APPBAR_HEIGHT = 56;
const BOTTOM_BAR_HEIGHT = 64;

const MobileAppBar = styled(AppBar)(({ theme }) => ({
  position: "fixed",
  top: 0,
  backgroundColor: theme.palette.background.paper,
  backgroundImage: "none",
  boxShadow: "none",
  color: theme.palette.text.primary,
}));

const MobileSceneContainer = styled("div")<{ height: string }>(
  ({ height }) => ({
    marginTop: TOP_APPBAR_HEIGHT,
    height,
    position: "relative",
  })
);

const MobileBottomNav = styled("div")(({ theme }) => ({
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  height: BOTTOM_BAR_HEIGHT,
  backgroundColor: theme.palette.background.paper,
  display: "flex",
  justifyContent: "space-around",
  alignItems: "center",
  boxShadow: theme.shadows[4],
  zIndex: 1300,
}));

const MobileDetailsContainer = styled("div")(({ theme }) => ({
  padding: theme.spacing(2),
}));

interface MobileLayoutProps {
  project: any;
  currentObservation: any;
  previewMode: boolean;
  setPreviewMode: (value: boolean) => void;
  previewIndex: number;
  observationPoints: any[];
  nextObservation: () => void;
  prevObservation: () => void;
  drawerOpen: boolean;
  setDrawerOpen: (value: boolean) => void;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({
  project,
  currentObservation,
  previewMode,
  setPreviewMode,
  previewIndex,
  observationPoints,
  nextObservation,
  prevObservation,
  drawerOpen,
  setDrawerOpen,
}) => {
  const sceneContainerHeight = `calc(100vh - ${
    TOP_APPBAR_HEIGHT + BOTTOM_BAR_HEIGHT
  }px)`;

  return (
    <>
      <MobileAppBar position="fixed">
        <Toolbar>
          <LogoHeader />
        </Toolbar>
      </MobileAppBar>
      <MobileSceneContainer height={sceneContainerHeight}>
        <PreviewScene
          initialSceneData={project.sceneData}
          renderObservationPoints={false}
          enableXR={false}
        />
      </MobileSceneContainer>
      <MobileBottomNav>
        <IconButton color="inherit" onClick={() => setDrawerOpen(true)}>
          <InfoIcon />
        </IconButton>
        <IconButton
          color="inherit"
          onClick={prevObservation}
          disabled={previewIndex === 0}
        >
          <NavigateBeforeIcon />
        </IconButton>
        <IconButton
          color="inherit"
          onClick={nextObservation}
          disabled={
            !observationPoints || previewIndex >= observationPoints.length - 1
          }
        >
          <NavigateNextIcon />
        </IconButton>
      </MobileBottomNav>
      <Drawer
        anchor="bottom"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { boxShadow: "none", marginBottom: `${BOTTOM_BAR_HEIGHT}px` },
        }}
        ModalProps={{
          BackdropProps: { invisible: true },
        }}
      >
        <MobileDetailsContainer>
          <Typography variant="h6" gutterBottom>
            {project.title}
          </Typography>
          <Typography variant="body1" gutterBottom>
            {project.description}
          </Typography>
          <div style={{ marginTop: 16 }}>
            <Typography variant="subtitle1">
              {currentObservation?.title || "Untitled"}
            </Typography>
            <Typography variant="body2">
              {currentObservation?.description || "No description provided."}
            </Typography>
          </div>
          <div style={{ marginTop: 16 }}>
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
          </div>
        </MobileDetailsContainer>
      </Drawer>
    </>
  );
};

export default MobileLayout;
