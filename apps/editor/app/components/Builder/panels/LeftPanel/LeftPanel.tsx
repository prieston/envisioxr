"use client";

import React, { useMemo } from "react";
import { Box } from "@mui/material";
import { useSceneStore, useWorldStore } from "@envisio/core";
import { getLeftPanelConfig } from "@envisio/config/factory";
import { LeftPanelContainer, GenericPanel } from "@envisio/ui";
import SettingRenderer from "../../SettingRenderer";
import LogoHeader from "@/app/components/AppBar/LogoHeader";

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
    // Zustand setters are stable and don't need to be in dependency array
  }, [engine, gridEnabled, skyboxType, ambientLightIntensity, basemapType]);

  return (
    <LeftPanelContainer
      previewMode={previewMode}
      className="glass-panel"
      sx={{ maxHeight: "none !important", height: "calc(100vh - 32px)" }}
    >
      {/* Logo Header - Fixed height, doesn't shrink */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          height: "64px",
          borderBottom: "1px solid rgba(100, 116, 139, 0.2)",
          mb: 2,
          px: 2,
          flexShrink: 0,
        }}
      >
        <LogoHeader />
      </Box>

      {/* Panel Content - Takes remaining space using flex: 1 */}
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <GenericPanel
          Container={({ children }) => <>{children}</>}
          config={config}
          renderSetting={(setting) => <SettingRenderer setting={setting} />}
          previewMode={previewMode}
        />
      </Box>
    </LeftPanelContainer>
  );
};

export default LeftPanel;
