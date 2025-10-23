"use client";

import React, { useMemo } from "react";
import { Divider } from "@mui/material";
import { useSceneStore, useWorldStore } from "@envisio/core";
import { getBottomPanelConfig } from "@envisio/config/factory";
import { BottomPanelContainer } from "@envisio/ui";
import SettingRenderer from "../../SettingRenderer";

const BottomPanelNew: React.FC = () => {
  // Use specific selectors instead of subscribing to entire store
  const previewMode = useSceneStore((state) => state.previewMode);
  const { engine } = useWorldStore();

  // Get all the state values and setters that the configuration depends on
  const viewMode = useSceneStore((state) => state.viewMode);
  const setViewMode = useSceneStore((state) => state.setViewMode);
  const isPlaying = useSceneStore((state) => state.isPlaying);
  const togglePlayback = useSceneStore((state) => state.togglePlayback);
  const observationPoints = useSceneStore((state) => state.observationPoints);
  const selectedObservation = useSceneStore(
    (state) => state.selectedObservation
  );
  const addObservationPoint = useSceneStore(
    (state) => state.addObservationPoint
  );
  const selectObservation = useSceneStore((state) => state.selectObservation);
  const deleteObservationPoint = useSceneStore(
    (state) => state.deleteObservationPoint
  );
  const nextObservation = useSceneStore((state) => state.nextObservation);
  const prevObservation = useSceneStore((state) => state.prevObservation);
  const previewIndex = useSceneStore((state) => state.previewIndex);
  const setPreviewIndex = useSceneStore((state) => state.setPreviewIndex);
  const setPreviewMode = useSceneStore((state) => state.setPreviewMode);

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
      deleteObservationPoint,
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
    deleteObservationPoint,
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
      {currentTab.settings.map((setting, index) => {
        // All sections fit their content
        const flexStyle = { flex: "0 0 auto", display: "flex" };

        return (
          <React.Fragment key={setting.id}>
            <div style={flexStyle}>
              <SettingRenderer setting={setting} />
            </div>
            {index < currentTab.settings.length - 1 && (
              <Divider orientation="vertical" flexItem />
            )}
          </React.Fragment>
        );
      })}
    </BottomPanelContainer>
  );
};

export default BottomPanelNew;
