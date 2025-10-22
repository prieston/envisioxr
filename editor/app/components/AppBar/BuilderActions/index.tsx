"use client";

import React, { useState } from "react";
import {
  Save as SaveIcon,
  Publish as PublishIcon,
  Inventory as InventoryIcon,
} from "@mui/icons-material";
import { useSceneStore } from "@envisio/core";
import { showToast } from "@envisio/core/utils";
import { ActionButton, AssetManagerModal } from "@envisio/ui";
import ReportGenerator from "../../Report/ReportGenerator";
import { useAssetManager } from "./hooks/useAssetManager";
import { useCesiumIon } from "./hooks/useCesiumIon";

interface BuilderActionsProps {
  onSave?: () => Promise<void>;
  onPublish: () => void;
  // Model positioning callbacks
  selectingPosition?: boolean;
  setSelectingPosition?: (selecting: boolean) => void;
  selectedPosition?: [number, number, number] | null;
  setSelectedPosition?: (position: [number, number, number] | null) => void;
  pendingModel?: any;
  setPendingModel?: (model: any) => void;
}

const BuilderActions: React.FC<BuilderActionsProps> = ({
  onSave,
  onPublish,
  setSelectingPosition,
  setSelectedPosition,
  setPendingModel,
}) => {
  const [assetManagerOpen, setAssetManagerOpen] = useState(false);
  const { previewMode } = useSceneStore();

  // Get Cesium Ion assets from store
  const cesiumIonAssets = useSceneStore((s) => s.cesiumIonAssets) || [];

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

  const { ionUploading, ionUploadProgress, handleUploadToIon } = useCesiumIon();

  // Close asset manager when model is selected
  const handleModelSelectAndClose = (model: any) => {
    handleModelSelect(model);
    setAssetManagerOpen(false);
  };

  // Handle save button click
  const handleSave = async () => {
    if (onSave) {
      await onSave()
        .then(() => showToast("Saved!"))
        .catch(() => showToast("Error saving."));
    } else {
      showToast("Save action not yet implemented.");
    }
  };

  // Transform cesiumIonAssets to match CesiumAsset interface
  const cesiumAssets = cesiumIonAssets.map((asset: any) => ({
    id: asset.id?.toString() || "",
    assetId: asset.assetId,
    name: asset.name,
    apiKey: asset.apiKey,
    enabled: asset.enabled,
  }));

  return (
    <>
      <ActionButton
        icon={<InventoryIcon />}
        label="Assets"
        onClick={() => setAssetManagerOpen(true)}
        disabled={previewMode}
      />

      <ReportGenerator disabled={previewMode} />

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
