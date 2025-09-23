"use client";

import React, { useState } from "react";
import { Divider, IconButton } from "@mui/material";
import LogoHeader from "./LogoHeader.tsx";
import useSceneStore from "@/app/hooks/useSceneStore.ts";
import {
  AppBarContainer,
  ToolbarContainer,
  LeftSection,
  RightSection,
} from "./StyledComponents.tsx";
import BuilderTools from "./BuilderTools.tsx";
import BuilderActions from "./BuilderActions.tsx";
import PublishDialog from "./PublishDialog.tsx";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

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
  console.log("🔍 AdminAppBar component called with mode:", mode);

  const [openPublishDialog, setOpenPublishDialog] = useState(false);
  const { transformMode, setTransformMode, selectedObject } = useSceneStore();

  const handleTransformModeChange = (
    mode: "translate" | "rotate" | "scale"
  ) => {
    console.log("🔧 AdminAppBar transform mode change:", mode);
    setTransformMode(mode);
  };

  // Debug logging
  console.log("🔍 AdminAppBar render:", {
    selectedObject,
    transformMode,
    mode,
  });

  console.log("🔍 AdminAppBar BuilderTools should render:", mode === "builder");

  return (
    <>
      <AppBarContainer position="fixed">
        <ToolbarContainer>
          <LeftSection>
            <LogoHeader />
            {mode === "builder" && (
              <Divider
                orientation="vertical"
                flexItem
                sx={{ mx: 1, height: 24 }}
              />
            )}
          </LeftSection>

          {mode === "builder" && (
            <BuilderTools
              previewMode={false}
              selectedObject={selectedObject}
              transformMode={transformMode}
              onTransformModeChange={handleTransformModeChange}
            />
          )}

          <RightSection>
            {mode === "builder" && (
              <BuilderActions
                onSave={onSave}
                onPublish={() => setOpenPublishDialog(true)}
              />
            )}
            {mode === "simple" && (
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
                    "0%": {
                      transform: "scale(1)",
                    },
                    "50%": {
                      transform: "scale(1.1)",
                    },
                    "100%": {
                      transform: "scale(1)",
                    },
                  },
                }}
              >
                <HelpOutlineIcon />
              </IconButton>
            )}
          </RightSection>
        </ToolbarContainer>
      </AppBarContainer>

      <PublishDialog
        open={openPublishDialog}
        onClose={() => setOpenPublishDialog(false)}
        onConfirm={onPublish}
      />
    </>
  );
};

export default AdminAppBar;
