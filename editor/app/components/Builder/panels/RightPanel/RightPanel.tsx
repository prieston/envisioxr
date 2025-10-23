"use client";

import React, { useMemo } from "react";
import { useSceneStore, useWorldStore } from "@envisio/core";
import { getRightPanelConfig } from "@envisio/config/factory";
import { RightPanelContainer, GenericPanel } from "@envisio/ui";
import SettingRenderer from "../../SettingRenderer";

const RightPanel: React.FC = () => {
  const previewMode = useSceneStore((state) => state.previewMode);
  const { engine } = useWorldStore();

  const selectedObservation = useSceneStore((state) => state.selectedObservation);
  const viewMode = useSceneStore((state) => state.viewMode);
  const controlSettings = useSceneStore((state) => state.controlSettings);
  const updateObjectProperty = useSceneStore((state) => state.updateObjectProperty);
  const updateObservationPoint = useSceneStore((state) => state.updateObservationPoint);
  const deleteObservationPoint = useSceneStore((state) => state.deleteObservationPoint);
  const setCapturingPOV = useSceneStore((state) => state.setCapturingPOV);
  const updateControlSettings = useSceneStore((state) => state.updateControlSettings);

  // For selectedObject, exclude weatherData to prevent re-renders when IoT updates
  const selectedObject = useSceneStore((state) => {
    if (!state.selectedObject) return null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { weatherData, ...rest } = state.selectedObject;
    return rest;
  });

  const config = useMemo(() => {
    return getRightPanelConfig(
      selectedObject,
      selectedObservation,
      viewMode,
      controlSettings,
      updateObjectProperty,
      updateObservationPoint,
      deleteObservationPoint,
      setCapturingPOV,
      updateControlSettings,
      { engine }
    );
  }, [
    engine,
    selectedObject,
    selectedObservation,
    viewMode,
    controlSettings,
    updateObjectProperty,
    updateObservationPoint,
    deleteObservationPoint,
    setCapturingPOV,
    updateControlSettings,
  ]);

  return (
    <GenericPanel
      Container={RightPanelContainer}
      config={config}
      renderSetting={(setting) => <SettingRenderer setting={setting} />}
      previewMode={previewMode}
    />
  );
};

export default RightPanel;
