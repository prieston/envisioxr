"use client";

import React, { useMemo } from "react";
import { Divider } from "@mui/material";
import { useSceneStore, useWorldStore } from "@envisio/core";
import { getBottomPanelConfig } from "@envisio/config/factory";
import { BottomPanelContainer } from "./BottomPanel.styles";
import SettingRenderer from "../../SettingRenderer";

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
