"use client";

import React, { useState, useMemo } from "react";
import { Tabs, Tab } from "@mui/material";
import { useSceneStore, useWorldStore } from "@envisio/core";
import { getLeftPanelConfig } from "@envisio/config/factory";
import SettingRenderer from "../../SettingRenderer";

import { LeftPanelContainer, TabPanel } from "@envisio/ui";

const LeftPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const sceneStore = useSceneStore();
  const worldStore = useWorldStore();
  const { previewMode } = sceneStore;
  const { engine } = worldStore;

  // Get all the state values and setters that the configuration depends on
  const {
    gridEnabled,
    setGridEnabled,
    skyboxType,
    setSkyboxType,
    ambientLightIntensity,
    setAmbientLightIntensity,
    basemapType,
    setBasemapType,
  } = sceneStore;

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
          borderBottom: 1,
          borderColor: "divider",
          mb: 1,
          minHeight: "32px",
          "& .MuiTab-root": {
            color: "text.secondary",
            minHeight: "32px",
            padding: "4px 8px",
            fontSize: "0.875rem",
            flexDirection: "row",
            gap: "4px",
            justifyContent: "center",
            marginBottom: "6px",
            "&.Mui-selected": {
              color: "primary.main",
            },
            "& .MuiSvgIcon-root": {
              marginBottom: 0,
            },
          },
          "& .MuiTabs-indicator": {
            height: "2px",
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
