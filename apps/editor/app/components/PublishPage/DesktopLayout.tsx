"use client";

import React from "react";
import { Button, FormControlLabel, Switch, Typography, Box } from "@mui/material";
import { LeftPanelContainer } from "@envisio/ui";
import {
  DesktopContainer,
  SidebarHeader,
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
      <DesktopSceneContainer>
        <PreviewScene
          initialSceneData={project.sceneData}
          renderObservationPoints={false}
          enableXR={false}
          isPublishMode={true}
        />
      </DesktopSceneContainer>

      <LeftPanelContainer
        previewMode={false}
        sx={{
          position: "absolute",
          top: 16,
          left: 16,
          height: "calc(100vh - 32px)",
          maxHeight: "calc(100vh - 32px)",
          zIndex: 1000,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <SidebarHeader>
            <LogoHeader />
          </SidebarHeader>

          <SidebarHeader>
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
          </SidebarHeader>

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
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                fontWeight: 600,
                color: (theme) => theme.palette.text.primary,
              }}
            >
              {project.title}
            </Typography>
            <Typography
              variant="body1"
              gutterBottom
              sx={{
                color: (theme) => theme.palette.text.secondary,
              }}
            >
              {project.description}
            </Typography>
            <Separator />
            {currentObservation ? (
              <>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    fontWeight: 600,
                    color: (theme) => theme.palette.text.primary,
                  }}
                >
                  {currentObservation.title || "Untitled"}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: (theme) => theme.palette.text.secondary,
                  }}
                >
                  {currentObservation.description || "No description provided."}
                </Typography>
              </>
            ) : (
              <Typography
                variant="body2"
                sx={{
                  color: (theme) => theme.palette.text.secondary,
                }}
              >
                No observation point selected.
              </Typography>
            )}
          </SidebarContent>
        </Box>
      </LeftPanelContainer>
    </DesktopContainer>
  );
};

export default DesktopLayout;
