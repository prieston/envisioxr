"use client";

import React, { useState, useRef, useLayoutEffect } from "react";
import { Tabs, Tab } from "@mui/material";
import { TabPanel } from "./index";

// Generic panel configuration types (avoiding cross-package type imports)
interface PanelTab {
  id: string;
  label: string;
  icon?: React.ComponentType<any>;
  settings: any[];
}

interface PanelConfig {
  tabs: PanelTab[];
}

interface GenericPanelProps {
  Container: React.ComponentType<any>;
  config: PanelConfig;
  renderSetting: (setting: any) => React.ReactNode;
  previewMode?: boolean;
}

/**
 * Generic panel component that handles tabbed UI and setting rendering.
 * This is the base component for all builder panels (Left, Right, Bottom).
 *
 * @param Container - Styled container component (e.g., LeftPanelContainer)
 * @param config - Panel configuration with tabs and settings
 * @param renderSetting - Function to render individual settings
 * @param previewMode - Whether the panel is in preview mode
 */
export const GenericPanel: React.FC<GenericPanelProps> = ({
  Container,
  config,
  renderSetting,
  previewMode = false,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const tabPanelRef = useRef<HTMLDivElement>(null);
  const scrollPosRef = useRef(0);

  // Capture scroll position before render
  if (tabPanelRef.current) {
    scrollPosRef.current = tabPanelRef.current.scrollTop;
  }

  // Restore scroll position after render
  useLayoutEffect(() => {
    if (tabPanelRef.current && scrollPosRef.current > 0) {
      tabPanelRef.current.scrollTop = scrollPosRef.current;
    }
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const currentTab = config.tabs[activeTab];

  return (
    <Container previewMode={previewMode} className="glass-panel">
      {config.tabs.length > 1 && (
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
      )}

      <TabPanel ref={tabPanelRef}>
        {currentTab?.settings.map((setting) => (
          <React.Fragment key={setting.id}>
            {renderSetting(setting)}
          </React.Fragment>
        ))}
      </TabPanel>
    </Container>
  );
};
