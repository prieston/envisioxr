"use client";

import React, { useState, useMemo } from "react";
import { Tabs, Tab } from "@mui/material";
import { useSceneStore, useWorldStore } from "@envisio/core";
import { getLeftPanelConfig } from "@envisio/config/factory";
import SettingRenderer from "../../SettingRenderer";

import { LeftPanelContainer, TabPanel } from "@envisio/ui";

const LeftPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  // Use specific selectors instead of subscribing to entire store
  const previewMode = useSceneStore((state) => state.previewMode);
  const { engine } = useWorldStore();

  // Get all the state values and setters that the configuration depends on
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

  // Recreate configuration whenever state changes
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const currentTab = config.tabs[activeTab];

  return (
    <LeftPanelContainer previewMode={previewMode} className="glass-panel">
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{
          mb: 2,
          minHeight: "40px",
          "& .MuiTab-root": {
            color: "rgba(100, 116, 139, 0.8)",
            minHeight: "40px",
            padding: "8px 12px",
            fontSize: "0.813rem",
            fontWeight: 500,
            flexDirection: "row",
            gap: "6px",
            justifyContent: "center",
            borderRadius: "8px",
            margin: "0 2px",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            textTransform: "none",
            "&:hover": {
              backgroundColor: "rgba(37, 99, 235, 0.08)",
              color: "#2563eb",
            },
            "&.Mui-selected": {
              color: "#2563eb",
              backgroundColor: "rgba(37, 99, 235, 0.12)",
              fontWeight: 600,
            },
            "& .MuiSvgIcon-root": {
              marginBottom: 0,
              fontSize: "1.1rem",
            },
          },
          "& .MuiTabs-indicator": {
            display: "none",
          },
        }}
      >
        {config.tabs.map((tab) => (
          <Tab
            key={tab.id}
            icon={tab.icon ? <tab.icon /> : undefined}
            label={tab.label}
            sx={{ textTransform: "none" }}
          />
        ))}
      </Tabs>

      <TabPanel>
        {currentTab.settings.map((setting) => (
          <SettingRenderer key={setting.id} setting={setting} />
        ))}
      </TabPanel>
    </LeftPanelContainer>
  );
};

export default LeftPanel;
