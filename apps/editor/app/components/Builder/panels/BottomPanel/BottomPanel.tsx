"use client";

import React, { useMemo } from "react";
import { useSceneStore, useWorldStore } from "@klorad/core";
import { getBottomPanelConfig } from "@klorad/config/factory";
import { BottomPanelContainer, GenericPanel } from "@klorad/ui";
import SettingRenderer from "../../SettingRenderer";

const BottomPanel: React.FC = () => {
  // Combine all scene store subscriptions into a single selector to reduce subscriptions from 19 to 1
  const sceneState = useSceneStore((state) => ({
    panelPreviewMode: state.previewMode,
    viewMode: state.viewMode,
    setViewMode: state.setViewMode,
    isPlaying: state.isPlaying,
    togglePlayback: state.togglePlayback,
    observationPoints: state.observationPoints,
    selectedObservation: state.selectedObservation,
    addObservationPoint: state.addObservationPoint,
    selectObservation: state.selectObservation,
    deleteObservationPoint: state.deleteObservationPoint,
    nextObservation: state.nextObservation,
    prevObservation: state.prevObservation,
    previewMode: state.previewMode,
    previewIndex: state.previewIndex,
    setPreviewIndex: state.setPreviewIndex,
    setPreviewMode: state.setPreviewMode,
  }));

  const { engine } = useWorldStore();

  const config = useMemo(() => {
    return getBottomPanelConfig(
      sceneState.viewMode,
      sceneState.setViewMode,
      sceneState.isPlaying,
      sceneState.togglePlayback,
      sceneState.observationPoints,
      sceneState.selectedObservation,
      sceneState.addObservationPoint,
      sceneState.selectObservation,
      sceneState.deleteObservationPoint,
      sceneState.nextObservation,
      sceneState.prevObservation,
      sceneState.previewMode,
      sceneState.previewIndex,
      sceneState.setPreviewIndex,
      sceneState.setPreviewMode,
      { engine }
    );
  }, [
    engine,
    sceneState.viewMode,
    sceneState.setViewMode,
    sceneState.isPlaying,
    sceneState.togglePlayback,
    sceneState.observationPoints,
    sceneState.selectedObservation,
    sceneState.addObservationPoint,
    sceneState.selectObservation,
    sceneState.deleteObservationPoint,
    sceneState.nextObservation,
    sceneState.prevObservation,
    sceneState.previewMode,
    sceneState.previewIndex,
    sceneState.setPreviewIndex,
    sceneState.setPreviewMode,
  ]);

  return (
    <GenericPanel
      Container={BottomPanelContainer}
      config={config}
      renderSetting={(setting) => <SettingRenderer setting={setting} />}
      previewMode={sceneState.panelPreviewMode}
    />
  );
};

export default BottomPanel;
