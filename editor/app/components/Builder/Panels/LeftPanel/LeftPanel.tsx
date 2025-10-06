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
