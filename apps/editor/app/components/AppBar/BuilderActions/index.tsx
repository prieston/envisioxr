"use client";

import React, { useState } from "react";
import {
  Save as SaveIcon,
  Publish as PublishIcon,
  Inventory as InventoryIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { useSceneStore } from "@klorad/core";
import { showToast, type LibraryAsset } from "@klorad/ui";
import { ActionButton, AssetManagerModal } from "@klorad/ui";
import ReportGenerator from "../../Report/ReportGenerator";
import ProjectSettingsModal from "../../Builder/ProjectSettingsModal";
import { useAssetManager } from "./hooks/useAssetManager";
import { useCesiumIon } from "./hooks/useCesiumIon";

interface PendingModel {
  name: string;
  url?: string;
  type?: string;
  fileType?: string;
  assetId?: string;
}

interface BuilderActionsProps {
  onSave?: () => Promise<void>;
  onPublish: () => void;
  projectId?: string;
  projectThumbnail?: string | null;
  onThumbnailUpdate?: () => void;
  // Model positioning callbacks
  selectingPosition?: boolean;
  setSelectingPosition?: (selecting: boolean) => void;
  selectedPosition?: [number, number, number] | null;
  setSelectedPosition?: (position: [number, number, number] | null) => void;
  pendingModel?: PendingModel | null;
  setPendingModel?: (model: PendingModel | null) => void;
}

const BuilderActions: React.FC<BuilderActionsProps> = ({
  onSave,
  onPublish,
  projectId,
  projectThumbnail,
  onThumbnailUpdate,
  setSelectingPosition,
  setSelectedPosition,
  setPendingModel,
}) => {
  const [assetManagerOpen, setAssetManagerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { previewMode } = useSceneStore();

  // Custom hooks for managing assets and Cesium Ion
  const {
    userAssets,
    uploading,
    uploadProgress,
    handleCustomModelUpload,
    handleModelSelect,
    handleDeleteModel,
    handleAssetUpdate,
    fetchUserAssets,
  } = useAssetManager({
    setSelectingPosition,
    setSelectedPosition,
    setPendingModel,
  });

  const {
    ionUploading,
    ionUploadProgress,
    handleUploadToIon,
    handleCesiumAssetAdd,
  } = useCesiumIon();

  // Close asset manager when model is selected
  const handleModelSelectAndClose = (model: LibraryAsset) => {
    handleModelSelect(model);
    setAssetManagerOpen(false);
  };

  // Handle save button click
  const handleSave = async () => {
    if (onSave) {
      await onSave();
      // Toast is shown in the parent component's handleSave
    } else {
      showToast("Save action not yet implemented.");
    }
  };

  return (
    <>
      <ActionButton
        icon={<InventoryIcon />}
        label="Assets"
        onClick={() => setAssetManagerOpen(true)}
        disabled={previewMode}
      />

      <ReportGenerator disabled={previewMode} />

      <ActionButton
        icon={<SettingsIcon />}
        label="Settings"
        onClick={() => setSettingsOpen(true)}
        disabled={previewMode}
      />

      {/* Project Settings Modal */}
      <ProjectSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        projectId={projectId}
        projectThumbnail={projectThumbnail}
        onThumbnailUpdate={onThumbnailUpdate}
      />

      {/* Asset Manager Modal */}
      <AssetManagerModal
        open={assetManagerOpen}
        onClose={() => setAssetManagerOpen(false)}
        // My Library
        userAssets={userAssets}
        onModelSelect={handleModelSelectAndClose}
        onAssetDelete={handleDeleteModel}
        onAssetUpdate={handleAssetUpdate}
        // Upload Model
        onCustomModelUpload={handleCustomModelUpload}
        customModelUploading={uploading}
        customModelUploadProgress={uploadProgress}
        // Upload to Ion
        onCesiumIonUpload={(data) => handleUploadToIon(data, fetchUserAssets)}
        ionUploading={ionUploading}
        ionUploadProgress={ionUploadProgress}
        // Add Ion Asset
        onCesiumAssetAdd={handleCesiumAssetAdd}
        onIonAssetAdded={fetchUserAssets}
      />

      <ActionButton
        icon={<SaveIcon />}
        label="Save"
        onClick={handleSave}
        disabled={previewMode}
      />

      <ActionButton
        icon={<PublishIcon />}
        label="Publish"
        onClick={onPublish}
        disabled={previewMode}
      />
    </>
  );
};

export default BuilderActions;
