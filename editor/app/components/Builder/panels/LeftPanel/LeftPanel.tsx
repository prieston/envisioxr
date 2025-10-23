"use client";

import React, { useMemo } from "react";
import { useSceneStore, useWorldStore } from "@envisio/core";
import { getLeftPanelConfig } from "@envisio/config/factory";
import { LeftPanelContainer, GenericPanel } from "@envisio/ui";
import SettingRenderer from "../../SettingRenderer";

const LeftPanel: React.FC = () => {
  const previewMode = useSceneStore((state) => state.previewMode);
  const { engine } = useWorldStore();

  const gridEnabled = useSceneStore((state) => state.gridEnabled);
  const setGridEnabled = useSceneStore((state) => state.setGridEnabled);
  const skyboxType = useSceneStore((state) => state.skyboxType);
  const setSkyboxType = useSceneStore((state) => state.setSkyboxType);
  const ambientLightIntensity = useSceneStore(
    (state) => state.ambientLightIntensity
  );
  const setAmbientLightIntensity = useSceneStore(
    (state) => state.setAmbientLightIntensity
  );
  const basemapType = useSceneStore((state) => state.basemapType);
  const setBasemapType = useSceneStore((state) => state.setBasemapType);

  const config = useMemo(() => {
    return getLeftPanelConfig(
      gridEnabled,
      setGridEnabled,
      skyboxType,
      setSkyboxType,
      ambientLightIntensity,
      setAmbientLightIntensity,
      basemapType,
      setBasemapType,
      { engine }
    );
  }, [
    engine,
    gridEnabled,
    setGridEnabled,
    skyboxType,
    setSkyboxType,
    ambientLightIntensity,
    setAmbientLightIntensity,
    basemapType,
    setBasemapType,
  ]);

  return (
    <GenericPanel
      Container={LeftPanelContainer}
      config={config}
      renderSetting={(setting) => <SettingRenderer setting={setting} />}
      previewMode={previewMode}
    />
  );
};

export default LeftPanel;
