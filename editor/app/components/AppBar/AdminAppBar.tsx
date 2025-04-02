"use client";

import React, { useState } from "react";
import { Divider } from "@mui/material";
import LogoHeader from "./LogoHeader";
import useSceneStore from "@/app/hooks/useSceneStore";
import {
  AppBarContainer,
  ToolbarContainer,
  LeftSection,
  RightSection,
} from "./StyledComponents";
import BuilderTools from "./BuilderTools";
import NavigationButtons from "./NavigationButtons";
import BuilderActions from "./BuilderActions";
import AddModelDialog from "./AddModelDialog";
import PublishDialog from "./PublishDialog";

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
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [openPublishDialog, setOpenPublishDialog] = useState(false);
  const {
    previewMode,
    setPreviewMode,
    transformMode,
    setTransformMode,
    selectedObject,
    nextObservation,
    prevObservation,
    addGoogleTiles,
  } = useSceneStore();

  const handleTransformModeChange = (
    mode: "translate" | "rotate" | "scale"
  ) => {
    setTransformMode(mode);
  };

  const handleAddTiles = (apiKey: string) => {
    addGoogleTiles(apiKey);
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
              previewMode={previewMode}
              selectedObject={selectedObject}
              transformMode={transformMode}
              onTransformModeChange={handleTransformModeChange}
              onAddModel={() => setDialogOpen(true)}
              onAddTiles={handleAddTiles}
            />
          )}

          <RightSection>
            {mode === "builder" ? (
              previewMode ? (
                <NavigationButtons
                  prevObservation={prevObservation}
                  nextObservation={nextObservation}
                  onExitPreview={() => setPreviewMode(false)}
                  hasPrevObservation={true}
                  hasNextObservation={true}
                />
              ) : (
                <BuilderActions
                  onSave={onSave}
                  onPublish={() => setOpenPublishDialog(true)}
                  onPreview={() => setPreviewMode(true)}
                />
              )
            ) : null}
          </RightSection>
        </ToolbarContainer>
      </AppBarContainer>

      <AddModelDialog
        open={isDialogOpen}
        onClose={() => setDialogOpen(false)}
      />

      <PublishDialog
        open={openPublishDialog}
        onClose={() => setOpenPublishDialog(false)}
        onConfirm={onPublish}
      />
    </>
  );
};

export default AdminAppBar;
