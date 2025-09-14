"use client";

import React, { useMemo } from "react";
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
})<BottomPanelContainerProps>(
  ({ theme: _theme, previewMode: _previewMode }) => ({
    width: "100%",
    height: "120px",
    marginTop: "8px",
    backgroundColor: "var(--glass-bg, rgba(255, 255, 255, 0.8))",
    backdropFilter: "blur(20px) saturate(130%)",
    WebkitBackdropFilter: "blur(20px) saturate(130%)",
    padding: _theme.spacing(2),
    display: "flex",
    alignItems: "center",
    gap: _theme.spacing(2),
    border: "1px solid var(--glass-border, rgba(255, 255, 255, 0.3))",
    borderRadius: "var(--glass-border-radius, 16px)",
    boxShadow: "var(--glass-shadow, 0 8px 32px rgba(0, 0, 0, 0.15))",
    userSelect: "none",
    pointerEvents: "auto",
    position: "relative",
    zIndex: 1400,
    transform: "translateZ(0)",
    willChange: "backdrop-filter",
    transition:
      "opacity 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: "inherit",
      background:
        "linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)",
      pointerEvents: "none",
      zIndex: -1,
    },
  })
);

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
    <BottomPanelContainer previewMode={previewMode} className="glass-panel">
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
