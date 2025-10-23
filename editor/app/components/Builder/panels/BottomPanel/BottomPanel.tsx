"use client";

import React, { useMemo } from "react";
import { useSceneStore, useWorldStore } from "@envisio/core";
import { getBottomPanelConfig } from "@envisio/config/factory";
import { BottomPanelContainer, GenericPanel } from "@envisio/ui";
import SettingRenderer from "../../SettingRenderer";

const BottomPanel: React.FC = () => {
  const panelPreviewMode = useSceneStore((state) => state.previewMode);
  const { engine } = useWorldStore();

  const viewMode = useSceneStore((state) => state.viewMode);
  const setViewMode = useSceneStore((state) => state.setViewMode);
  const isPlaying = useSceneStore((state) => state.isPlaying);
  const togglePlayback = useSceneStore((state) => state.togglePlayback);
  const observationPoints = useSceneStore((state) => state.observationPoints);
  const selectedObservation = useSceneStore((state) => state.selectedObservation);
  const addObservationPoint = useSceneStore((state) => state.addObservationPoint);
  const selectObservation = useSceneStore((state) => state.selectObservation);
  const deleteObservationPoint = useSceneStore((state) => state.deleteObservationPoint);
  const nextObservation = useSceneStore((state) => state.nextObservation);
  const prevObservation = useSceneStore((state) => state.prevObservation);
  const previewMode = useSceneStore((state) => state.previewMode);
  const previewIndex = useSceneStore((state) => state.previewIndex);
  const setPreviewIndex = useSceneStore((state) => state.setPreviewIndex);
  const setPreviewMode = useSceneStore((state) => state.setPreviewMode);

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
      setPreviewMode,
      { engine }
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

  return (
    <GenericPanel
      Container={BottomPanelContainer}
      config={config}
      renderSetting={(setting) => <SettingRenderer setting={setting} />}
      previewMode={panelPreviewMode}
    />
  );
};

export default BottomPanel;
