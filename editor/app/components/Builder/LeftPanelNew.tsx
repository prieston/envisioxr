"use client";

import React, { useState, useMemo } from "react";
import { styled } from "@mui/material/styles";
import { Box, Tabs, Tab } from "@mui/material";
import { useSceneStore } from "@envisio/core/state";
import useWorldStore from "../../hooks/useWorldStore";
import { getLeftPanelConfig } from "@envisio/config/factory";
import SettingRenderer from "./SettingRenderer";

// Container for the left panel with conditional styling based on previewMode
interface LeftPanelContainerProps {
  previewMode: boolean;
}

const LeftPanelContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== "previewMode",
})<LeftPanelContainerProps>(({ theme, previewMode }) => ({
  width: "280px",
  height: "100%",
  maxHeight: "calc(100vh - 120px)", // Ensure it doesn't exceed viewport
  marginRight: "8px",
  backgroundColor: "var(--glass-bg, rgba(255, 255, 255, 0.8))",
  backdropFilter: "blur(20px) saturate(130%)",
  WebkitBackdropFilter: "blur(20px) saturate(130%)",
  color: "var(--glass-text-primary, rgba(15, 23, 42, 0.95))",
  padding: theme.spacing(2),
  border: "1px solid var(--glass-border, rgba(255, 255, 255, 0.3))",
  borderRadius: "var(--glass-border-radius, 16px)",
  boxShadow: "var(--glass-shadow, 0 8px 32px rgba(0, 0, 0, 0.15))",
  userSelect: "none",
  pointerEvents: previewMode ? "none" : "auto",
  opacity: previewMode ? 0.5 : 1,
  cursor: previewMode ? "not-allowed" : "default",
  filter: previewMode ? "grayscale(100%)" : "none",
  transition: "opacity 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
  position: "relative",
  zIndex: 1400,
  transform: "translateZ(0)",
  willChange: "backdrop-filter",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: "inherit",
    background:
      "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
    pointerEvents: "none",
    zIndex: -1,
  },
}));

const TabPanel = styled(Box)(({ theme: _theme }) => ({
  padding: 0, // Remove padding from tab panel
  height: "calc(100% - 40px)", // 40px is the height of the tabs (32px + 8px margin)
  overflow: "auto",
  maxHeight: "calc(100vh - 200px)", // Ensure it doesn't exceed viewport
  "&::-webkit-scrollbar": {
    width: "6px",
  },
  "&::-webkit-scrollbar-track": {
    background: "rgba(0, 0, 0, 0.1)",
    borderRadius: "3px",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "rgba(11, 28, 129, 0.3)",
    borderRadius: "3px",
    "&:hover": {
      background: "rgba(11, 28, 129, 0.5)",
    },
  },
}));

const LeftPanelNew: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { previewMode } = useSceneStore();
  const { engine } = useWorldStore();

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
  } = useSceneStore();

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
      setBasemapType
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

export default LeftPanelNew;
