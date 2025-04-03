"use client";

import React, { useState } from "react";
import { Divider } from "@mui/material";
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

interface AdminAppBarProps {
  mode?: string;
  onSave?: () => Promise<void>;
  onPublish?: () => Promise<void>;
}

const AdminAppBar: React.FC<AdminAppBarProps> = ({
  mode = "builder",
  onSave,
  onPublish,
}) => {
  const [openPublishDialog, setOpenPublishDialog] = useState(false);
  const { transformMode, setTransformMode, selectedObject } = useSceneStore();

  const handleTransformModeChange = (
    mode: "translate" | "rotate" | "scale"
  ) => {
    setTransformMode(mode);
  };

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
