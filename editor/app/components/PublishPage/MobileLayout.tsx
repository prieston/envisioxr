"use client";

import dynamic from "next/dynamic";
import {
  IconButton,
  Drawer,
  FormControlLabel,
  Switch,
  Typography,
  Toolbar,
} from "@mui/material";
import {
  MobileAppBar,
  MobileSceneContainer,
  MobileBottomNav,
  MobileDetailsContainer,
  TOP_APPBAR_HEIGHT,
  BOTTOM_BAR_HEIGHT,
} from "./MobileLayout.styles";
import MenuIcon from "@mui/icons-material/Menu";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import LogoHeader from "../AppBar/LogoHeader";
import type { SceneProps } from "@envisio/engine-three";

const PreviewScene = dynamic(() => import("../Builder/Scene/PreviewScene"), {
  ssr: false,
});

type Observation = {
  id?: string | number;
  title?: string;
  description?: string;
};

type Project = {
  id?: string | number;
  title: string;
  description?: string;
  sceneData: NonNullable<SceneProps["initialSceneData"]>;
};

interface MobileLayoutProps {
  project: Project;
  currentObservation: Observation | null;
  previewMode: boolean;
  setPreviewMode: (value: boolean) => void;
  previewIndex: number;
  observationPoints: Observation[];
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
          isPublishMode={true}
        />
      </MobileSceneContainer>
      <MobileBottomNav>
        <IconButton color="inherit" onClick={() => setDrawerOpen(true)}>
          <MenuIcon />
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
          sx: {
            boxShadow: "none",
            marginBottom: `${BOTTOM_BAR_HEIGHT}px`,
            backgroundColor: "white",
          },
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
