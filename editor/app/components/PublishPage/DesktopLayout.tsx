"use client";

import React from "react";
import { Button, FormControlLabel, Switch, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import LogoHeader from "../AppBar/LogoHeader";
import PreviewScene from "../PreviewScene";

const DesktopContainer = styled("div")({
  display: "flex",
  height: "100vh",
});

const DesktopSidebar = styled("div")(({ theme }) => ({
  width: 300,
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(2),
  borderRight: "1px solid rgba(0,0,0,0.1)",
  display: "flex",
  flexDirection: "column",
}));

const SidebarContent = styled("div")({
  overflow: "auto",
  height: "100%",
  marginTop: 8,
});

const ButtonGroupContainer = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
}));

const DesktopSceneContainer = styled("div")({
  flexGrow: 1,
  position: "relative",
});

const Separator = styled("div")({
  borderBottom: "1px solid rgba(159, 159, 159, 0.1)",
  marginBottom: 16,
});

interface DesktopLayoutProps {
  project: any;
  currentObservation: any;
  previewMode: boolean;
  setPreviewMode: (value: boolean) => void;
  previewIndex: number;
  observationPoints: any[];
  nextObservation: () => void;
  prevObservation: () => void;
}

const DesktopLayout: React.FC<DesktopLayoutProps> = ({
  project,
  currentObservation,
  previewMode,
  setPreviewMode,
  previewIndex,
  observationPoints,
  nextObservation,
  prevObservation,
}) => {
  return (
    <DesktopContainer>
      <DesktopSidebar>
        <LogoHeader />
        <FormControlLabel
          control={
            <Switch
              checked={previewMode}
              onChange={(e) => setPreviewMode(e.target.checked)}
              color="primary"
            />
          }
          label={previewMode ? "Preview Mode" : "Free Navigation"}
          sx={{ marginBottom: 2 }}
        />
        <ButtonGroupContainer>
          <Button
            variant="outlined"
            onClick={prevObservation}
            disabled={previewIndex === 0}
            fullWidth
          >
            Previous
          </Button>
          <Button
            variant="outlined"
            onClick={nextObservation}
            disabled={
              !observationPoints || previewIndex >= observationPoints.length - 1
            }
            fullWidth
          >
            Next
          </Button>
        </ButtonGroupContainer>
        <SidebarContent>
          <Typography variant="h4" gutterBottom sx={{ marginTop: 2 }}>
            {project.title}
          </Typography>
          <Typography variant="body1" gutterBottom>
            {project.description}
          </Typography>
          <Separator />
          <div style={{ marginTop: 2 }}>
            {currentObservation ? (
              <>
                <Typography variant="h6" gutterBottom>
                  {currentObservation.title || "Untitled"}
                </Typography>
                <Typography variant="body2">
                  {currentObservation.description || "No description provided."}
                </Typography>
              </>
            ) : (
              <Typography variant="body2">
                No observation point selected.
              </Typography>
            )}
          </div>
        </SidebarContent>
      </DesktopSidebar>
      <DesktopSceneContainer>
        <PreviewScene
          initialSceneData={project.sceneData}
          renderObservationPoints={false}
          enableXR={false}
          isPublishMode={true}
        />
      </DesktopSceneContainer>
    </DesktopContainer>
  );
};

export default DesktopLayout;
