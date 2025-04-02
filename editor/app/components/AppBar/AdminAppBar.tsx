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
import NavigationButtons from "./NavigationButtons.tsx";
import BuilderActions from "./BuilderActions.tsx";
import AddModelDialog from "./AddModelDialog.tsx";
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
    addCesiumIonTiles,
  } = useSceneStore();

  const handleTransformModeChange = (
    mode: "translate" | "rotate" | "scale"
  ) => {
    setTransformMode(mode);
  };

  const handleAddTiles = (apiKey: string) => {
    addGoogleTiles(apiKey);
  };

  const handleAddCesiumIonTiles = () => {
    addCesiumIonTiles();
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
              onAddCesiumIonTiles={handleAddCesiumIonTiles}
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
