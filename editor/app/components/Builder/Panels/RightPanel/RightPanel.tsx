"use client";

import React, { useState, useMemo } from "react";
import { Tabs, Tab } from "@mui/material";
import { useSceneStore, useWorldStore } from "@envisio/core";
import { getRightPanelConfig } from "@envisio/config/factory";
import SettingRenderer from "../../SettingRenderer";
import { RightPanelContainer, TabPanel } from "@envisio/ui";

const RightPanelNew: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  // Use specific selectors instead of subscribing to entire store
  const previewMode = useSceneStore((state) => state.previewMode);
  const { engine } = useWorldStore();

  // Get all the state values and setters that the configuration depends on
  // Use specific selectors to avoid unnecessary re-renders
  const selectedObservation = useSceneStore(
    (state) => state.selectedObservation
  );
  const viewMode = useSceneStore((state) => state.viewMode);
  const controlSettings = useSceneStore((state) => state.controlSettings);
  const updateObjectProperty = useSceneStore(
    (state) => state.updateObjectProperty
  );
  const updateObservationPoint = useSceneStore(
    (state) => state.updateObservationPoint
  );
  const deleteObservationPoint = useSceneStore(
    (state) => state.deleteObservationPoint
  );
  const setCapturingPOV = useSceneStore((state) => state.setCapturingPOV);
  const updateControlSettings = useSceneStore(
    (state) => state.updateControlSettings
  );

  // For selectedObject, exclude weatherData to prevent re-renders when IoT updates
  const selectedObject = useSceneStore((state) => {
    if (!state.selectedObject) return null;
    const { weatherData, ...rest } = state.selectedObject;
    return rest;
  });

  // Recreate configuration whenever state changes
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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const currentTab = config.tabs[activeTab];

  return (
    <RightPanelContainer previewMode={previewMode} className="glass-panel">
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{
          flexShrink: 0,
          mb: 2,
          minHeight: "48px",
          "& .MuiTab-root": {
            color: "rgba(100, 116, 139, 0.8)",
            minHeight: "40px",
            padding: "8px 12px",
            fontSize: "0.813rem", // 13px - section titles
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
    </RightPanelContainer>
  );
};

export default RightPanelNew;
