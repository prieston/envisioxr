"use client";

import React, { useMemo, useState } from "react";
import { Divider, IconButton } from "@mui/material";
import LogoHeader from "./LogoHeader.tsx";
import { useSceneStore, useWorldStore } from "@envisio/core";
import { getTopBarConfig } from "@envisio/config/factory";
import TopBarToolRenderer from "./TopBarToolRenderer";
import {
  AppBarContainer,
  ToolbarContainer,
  LeftSection,
  RightSection,
} from "./StyledComponents.tsx";
import { PublishDialog } from "@envisio/ui";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { logger } from "./logger";

interface AdminAppBarProps {
  mode?: string;
  onSave?: () => Promise<void>;
  onPublish?: () => Promise<void>;
  onHelpClick?: () => void;
  showHelpPulse?: boolean;
}

const AdminAppBar: React.FC<AdminAppBarProps> = ({
  mode = "builder",
  onSave,
  onPublish,
  onHelpClick,
  showHelpPulse = false,
}) => {
  logger.debug("🔍 AdminAppBar component called with mode:", mode);

  const [openPublishDialog, setOpenPublishDialog] = useState(false);
  const { engine } = useWorldStore();

  // Only subscribe to the specific properties we need, excluding weatherData
  const transformMode = useSceneStore((state) => state.transformMode);
  const setTransformMode = useSceneStore((state) => state.setTransformMode);
  const previewMode = useSceneStore((state) => state.previewMode);

  // For selectedObject, only subscribe to the properties we actually use (id, name, etc.)
  // Exclude weatherData to prevent re-renders when IoT updates
  const selectedObject = useSceneStore((state) => {
    if (!state.selectedObject) return null;
    const { weatherData, ...rest } = state.selectedObject;
    return rest;
  });

  const handleTransformModeChange = (
    mode: "translate" | "rotate" | "scale"
  ) => {
    logger.debug("🔧 AdminAppBar transform mode change:", mode);
    setTransformMode(mode);
  };

  const handleSave = async () => {
    if (onSave) {
      try {
        await onSave();
      } catch (error) {
        // intentionally silent; toast handled upstream
      }
    }
  };

  const handlePublish = () => {
    setOpenPublishDialog(true);
  };

  // Config for builder mode
  const config = useMemo(() => {
    if (mode !== "builder") return null;
    return getTopBarConfig(
      selectedObject,
      transformMode,
      handleTransformModeChange,
      handleSave,
      handlePublish,
      previewMode
    );
  }, [mode, engine, selectedObject, transformMode, previewMode]);

  logger.debug("🔍 AdminAppBar render:", {
    selectedObject,
    transformMode,
    mode,
  });

  if (mode === "builder") {
    const leftSection = config?.sections.find((s) => s.type === "left");
    const centerSection = config?.sections.find((s) => s.type === "center");
    const rightSection = config?.sections.find((s) => s.type === "right");

    return (
      <>
        <AppBarContainer position="fixed" className="glass-panel">
          <ToolbarContainer>
            <LeftSection>
              {leftSection?.tools.map((tool) => (
                <TopBarToolRenderer key={tool.id} tool={tool} />
              ))}
              <Divider
                orientation="vertical"
                flexItem
                sx={{ mx: 1, height: 24 }}
              />
            </LeftSection>

            <div
              style={{
                flexGrow: 1,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {centerSection?.tools.map((tool) => (
                <TopBarToolRenderer key={tool.id} tool={tool} />
              ))}
            </div>

            <RightSection>
              {rightSection?.tools.map((tool) => (
                <TopBarToolRenderer key={tool.id} tool={tool} />
              ))}
            </RightSection>
          </ToolbarContainer>
        </AppBarContainer>

        <PublishDialog
          open={openPublishDialog}
          onClose={() => setOpenPublishDialog(false)}
          onConfirm={onPublish}
          title="Publish World"
          description="Are you sure you want to publish this world? It will be publicly available."
          confirmLabel="Publish"
        />
      </>
    );
  }

  // Simple mode (dashboard/edit)
  return (
    <>
      <AppBarContainer position="fixed">
        <ToolbarContainer>
          <LeftSection>
            <LogoHeader />
          </LeftSection>

          <RightSection>
            <IconButton
              onClick={onHelpClick}
              sx={{
                color: "var(--glass-text-secondary, #646464)",
                animation: showHelpPulse ? "pulse 2s infinite" : "none",
                "&:hover": {
                  animation: "none",
                  backgroundColor: "rgba(37, 99, 235, 0.1)",
                  color: "var(--glass-text-primary, #2563eb)",
                  transform: "scale(1.1)",
                },
                transition: "transform 0.2s ease",
                "@keyframes pulse": {
                  "0%": { transform: "scale(1)" },
                  "50%": { transform: "scale(1.1)" },
                  "100%": { transform: "scale(1)" },
                },
              }}
            >
              <HelpOutlineIcon />
            </IconButton>
          </RightSection>
        </ToolbarContainer>
      </AppBarContainer>

      <PublishDialog
        open={openPublishDialog}
        onClose={() => setOpenPublishDialog(false)}
        onConfirm={onPublish}
        title="Publish World"
        description="Are you sure you want to publish this world? It will be publicly available."
        confirmLabel="Publish"
      />
    </>
  );
};

export default AdminAppBar;
