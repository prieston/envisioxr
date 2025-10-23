"use client";

import React from "react";
import { Button, FormControlLabel, Switch, Typography } from "@mui/material";
import {
  DesktopContainer,
  DesktopSidebar,
  SidebarContent,
  ButtonGroupContainer,
  DesktopSceneContainer,
  Separator,
} from "./DesktopLayout.styles";
import LogoHeader from "../AppBar/LogoHeader";
import PreviewScene from "../Builder/Scene/PreviewScene";

type Observation = {
  id?: string | number;
  title?: string;
  description?: string;
};

type Project = {
  id?: string | number;
  title: string;
  description?: string;
  sceneData: Parameters<typeof PreviewScene>[0]["initialSceneData"];
};

interface DesktopLayoutProps {
  project: Project;
  currentObservation: Observation | null;
  previewMode: boolean;
  setPreviewMode: (value: boolean) => void;
  previewIndex: number;
  observationPoints: Observation[];
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
