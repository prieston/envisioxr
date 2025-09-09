"use client";

import React, { useState, useEffect, useMemo } from "react";
import { styled } from "@mui/material/styles";
import { Box, Divider } from "@mui/material";
import useSceneStore from "../../hooks/useSceneStore";
import useWorldStore from "../../hooks/useWorldStore";
import { getBottomPanelConfig } from "../../config/panelConfigFactory";
import SettingRenderer from "./SettingRenderer";

// Container for the entire bottom panel
interface BottomPanelContainerProps {
  previewMode: boolean;
}

const BottomPanelContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== "previewMode",
})<BottomPanelContainerProps>(({ theme }) => ({
  width: "100%",
  height: "120px",
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(2),
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
  userSelect: "none",
}));

const BottomPanelNew: React.FC = () => {
  const { previewMode } = useSceneStore();
  const { engine } = useWorldStore();

  // Get all the state values and setters that the configuration depends on
  const {
    viewMode,
    setViewMode,
    isPlaying,
    togglePlayback,
    observationPoints,
    selectedObservation,
    addObservationPoint,
    selectObservation,
    nextObservation,
    prevObservation,
    previewIndex,
    setPreviewIndex,
    setPreviewMode,
  } = useSceneStore();

  // Recreate configuration whenever state changes
  const config = useMemo(() => {
    return getBottomPanelConfig(
      viewMode,
      setViewMode,
      isPlaying,
      togglePlayback,
      observationPoints,
      selectedObservation,
      addObservationPoint,
      selectObservation,
      nextObservation,
      prevObservation,
      previewMode,
      previewIndex,
      setPreviewIndex,
      setPreviewMode
    );
  }, [
    engine,
    viewMode,
    setViewMode,
    isPlaying,
    togglePlayback,
    observationPoints,
    selectedObservation,
    addObservationPoint,
    selectObservation,
    nextObservation,
    prevObservation,
    previewMode,
    previewIndex,
    setPreviewIndex,
    setPreviewMode,
  ]);

  const currentTab = config.tabs[0]; // Bottom panel only has one tab

  return (
    <BottomPanelContainer previewMode={previewMode}>
      {currentTab.settings.map((setting, index) => (
        <React.Fragment key={setting.id}>
          <SettingRenderer setting={setting} />
          {index < currentTab.settings.length - 1 && (
            <Divider orientation="vertical" flexItem />
          )}
        </React.Fragment>
      ))}
    </BottomPanelContainer>
  );
};

export default BottomPanelNew;
