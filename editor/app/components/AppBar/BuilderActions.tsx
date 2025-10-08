"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Typography } from "@mui/material";
import {
  Save as SaveIcon,
  Publish as PublishIcon,
  Inventory as InventoryIcon,
} from "@mui/icons-material";
import { MinimalButton } from "./StyledComponents";
import { showToast } from "@envisio/core/utils";
import { useSceneStore } from "@envisio/core";
import ReportGenerator from "../Report/ReportGenerator";
import {
  AssetManagerModal,
  type LibraryAsset,
  type CesiumAsset,
} from "@envisio/ui";
import { clientEnv } from "@/lib/env/client";

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
  selectingPosition = false,
  setSelectingPosition,
  selectedPosition = null,
  setSelectedPosition,
  pendingModel = null,
  setPendingModel,
}) => {
  const { previewMode } = useSceneStore();
  const [assetManagerOpen, setAssetManagerOpen] = useState(false);

  // Asset Manager State
  const [userAssets, setUserAssets] = useState<LibraryAsset[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [ionUploading, setIonUploading] = useState(false);
  const [ionUploadProgress, setIonUploadProgress] = useState(0);

  // Get Cesium Ion assets from store
  const cesiumIonAssets = useSceneStore((s) => s.cesiumIonAssets) || [];
  const addCesiumIonAsset = useSceneStore((s) => s.addCesiumIonAsset);
  const removeCesiumIonAsset = useSceneStore((s) => s.removeCesiumIonAsset);
  const toggleCesiumIonAsset = useSceneStore((s) => s.toggleCesiumIonAsset);
  const flyToCesiumIonAsset = useSceneStore((s) => s.flyToCesiumIonAsset);
  const addModel = useSceneStore((state) => state.addModel);

  // Fetch user's uploaded models when component mounts
  useEffect(() => {
    fetch("/api/models")
      .then((res) => res.json())
      .then((data) => {
        setUserAssets(data.assets || []);
      })
      .catch((err) => {
        console.error("Error fetching models:", err);
        showToast("Failed to load models");
      });
  }, []);

  // Helper function to convert dataURL to Blob
  const dataURLtoBlob = (dataurl: string) => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  // Helper function to upload files with progress
  const uploadFileWithProgress = async (
    file: Blob,
    fileName: string,
    fileType: string,
    onProgress: ((progress: number) => void) | null
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", fileName);
    formData.append("fileType", fileType);
    formData.append("bucketName", clientEnv.NEXT_PUBLIC_S3_BUCKET || "");

    return new Promise<any>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      if (onProgress) {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round(
              (event.loaded / event.total) * 100
            );
            onProgress(percentComplete);
          }
        });
      }

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener("error", () => reject(new Error("Upload failed")));
      xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

      xhr.open("POST", "/api/upload");
      xhr.send(formData);
    });
  };

  // Handle custom model upload
  const handleCustomModelUpload = async (data: {
    file: File;
    friendlyName: string;
    metadata: Array<{ label: string; value: string }>;
    screenshot: string | null;
  }) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      // Upload the model file
      const modelUpload = await uploadFileWithProgress(
        data.file,
        data.file.name,
        data.file.type,
        setUploadProgress
      );

      // Upload thumbnail if available
      let thumbnailUpload = null;
      if (data.screenshot) {
        const thumbnailBlob = dataURLtoBlob(data.screenshot);
        const thumbnailFileName = data.friendlyName + "-thumbnail.png";
        thumbnailUpload = await uploadFileWithProgress(
          thumbnailBlob,
          thumbnailFileName,
          "image/png",
          null
        );
      }

      // Save model metadata to database
      const postData = {
        asset: {
          originalFilename: data.friendlyName,
          fileUrl: modelUpload.fileUrl,
          fileType: data.file.type,
        },
        thumbnail: thumbnailUpload ? thumbnailUpload.publicUrl : null,
        metadata: data.metadata.reduce((acc: any, item) => {
          if (item.label && item.value) {
            acc[item.label] = item.value;
          }
          return acc;
        }, {}),
      };

      const saveResponse = await fetch("/api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });

      if (!saveResponse.ok) {
        throw new Error("Failed to save model metadata");
      }

      const saveResult = await saveResponse.json();
      showToast(`Uploaded ${data.friendlyName} successfully.`);

      // Add the new model to the userAssets list
      const newModel: LibraryAsset = {
        id: saveResult.asset.id,
        originalFilename: data.friendlyName,
        fileUrl: modelUpload.fileUrl,
        fileType: data.file.type,
        thumbnail: thumbnailUpload?.publicUrl,
        metadata: postData.metadata,
      };
      setUserAssets((prev) => [...prev, newModel]);

      // Automatically add to scene
      handleModelSelect(newModel);
    } catch (error) {
      console.error("Upload error:", error);
      showToast("An error occurred during upload.");
      throw error;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle model selection (trigger positioning mode)
  const handleModelSelect = (model: LibraryAsset) => {
    if (setPendingModel && setSelectingPosition && setSelectedPosition) {
      // Store the model temporarily and enter positioning mode
      setPendingModel({
        name: model.originalFilename,
        url: model.fileUrl,
        type: model.fileType,
        fileType: model.fileType,
        assetId: model.id,
      });
      setSelectedPosition(null);
      setSelectingPosition(true);
      setAssetManagerOpen(false); // Close the modal
      showToast("Click anywhere in the scene to position the model");
    } else {
      // Fallback: add directly at origin if positioning not available
      addModel({
        name: model.originalFilename,
        url: model.fileUrl,
        type: model.fileType,
        position: [0, 0, 0],
        scale: [1, 1, 1],
        rotation: [0, 0, 0],
      });
      showToast(`Added ${model.originalFilename} to scene`);
    }
  };

  // Handle model deletion
  const handleDeleteModel = async (assetId: string) => {
    try {
      const res = await fetch("/api/models", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId }),
      });

      if (res.ok) {
        showToast("Asset deleted successfully.");
        setUserAssets((prev) => prev.filter((asset) => asset.id !== assetId));
      } else {
        showToast("Failed to delete asset.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      showToast("An error occurred during deletion.");
    }
  };

  // Handle Cesium Ion asset addition
  const handleCesiumAssetAdd = (data: {
    assetId: string;
    name: string;
    apiKey?: string;
  }) => {
    addCesiumIonAsset({
      name: data.name,
      apiKey: data.apiKey || "",
      assetId: data.assetId,
      enabled: true,
    });
    showToast(`Added Cesium Ion asset: ${data.name}`);
  };

  // Handle upload to Cesium Ion
  const handleUploadToIon = async (data: {
    file: File;
    name: string;
    description: string;
    sourceType: string;
    longitude?: number;
    latitude?: number;
    height?: number;
  }): Promise<{ assetId: string }> => {
    setIonUploading(true);
    setIonUploadProgress(0);

    try {
      // TODO: Implement actual Cesium Ion upload using their API
      // This is a placeholder implementation
      // You'll need to use the Cesium Ion REST API or SDK

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setIonUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      // Placeholder: Upload file and create asset on Cesium Ion
      // In reality, you'd use fetch or axios to call Cesium Ion API
      await new Promise((resolve) => setTimeout(resolve, 2000));

      clearInterval(progressInterval);
      setIonUploadProgress(100);

      // Placeholder asset ID - replace with actual from Cesium Ion response
      const assetId = `temp-${Date.now()}`;

      showToast(`Successfully uploaded to Cesium Ion!`);

      return { assetId };
    } catch (error) {
      console.error("Ion upload error:", error);
      showToast("An error occurred during Cesium Ion upload.");
      throw error;
    } finally {
      setIonUploading(false);
      setIonUploadProgress(0);
    }
  };

  // Transform cesiumIonAssets to match CesiumAsset interface
  const cesiumAssets: CesiumAsset[] = cesiumIonAssets.map((asset: any) => ({
    id: asset.id.toString(),
    assetId: asset.assetId,
    name: asset.name,
    apiKey: asset.apiKey,
    enabled: asset.enabled,
  }));

  return (
    <>
      <MinimalButton
        onClick={() => setAssetManagerOpen(true)}
        disabled={previewMode}
      >
        <InventoryIcon />
        <Typography
          sx={{
            fontSize: "0.75rem",
            fontWeight: 400,
            letterSpacing: "0.01em",
            lineHeight: 1,
          }}
        >
          Assets
        </Typography>
      </MinimalButton>

      <ReportGenerator disabled={previewMode} />

      {/* Asset Manager Modal */}
      <AssetManagerModal
        open={assetManagerOpen}
        onClose={() => setAssetManagerOpen(false)}
        // My Library
        userAssets={userAssets}
        onModelSelect={handleModelSelect}
        onAssetDelete={handleDeleteModel}
        // Upload Model
        onCustomModelUpload={handleCustomModelUpload}
        customModelUploading={uploading}
        customModelUploadProgress={uploadProgress}
        // Cesium Ion Asset
        cesiumAssets={cesiumAssets}
        onCesiumAssetAdd={handleCesiumAssetAdd}
        onCesiumAssetToggle={toggleCesiumIonAsset}
        onCesiumAssetRemove={removeCesiumIonAsset}
        onCesiumAssetFlyTo={flyToCesiumIonAsset}
        // Upload to Ion
        onCesiumIonUpload={handleUploadToIon}
        ionUploading={ionUploading}
        ionUploadProgress={ionUploadProgress}
      />

      <MinimalButton
        onClick={async () => {
          if (onSave) {
            await onSave()
              .then(() => showToast("Saved!"))
              .catch(() => showToast("Error saving."));
          } else {
            showToast("Save action not yet implemented.");
          }
        }}
        disabled={previewMode}
      >
        <SaveIcon />
        <Typography
          sx={{
            fontSize: "0.75rem", // 12px - toolbar labels
            fontWeight: 400, // Normal weight
            letterSpacing: "0.01em",
            lineHeight: 1,
          }}
        >
          Save
        </Typography>
      </MinimalButton>
      <MinimalButton onClick={onPublish} disabled={previewMode}>
        <PublishIcon />
        <Typography
          sx={{
            fontSize: "0.75rem", // 12px - toolbar labels
            fontWeight: 400, // Normal weight
            letterSpacing: "0.01em",
            lineHeight: 1,
          }}
        >
          Publish
        </Typography>
      </MinimalButton>
    </>
  );
};

export default BuilderActions;
