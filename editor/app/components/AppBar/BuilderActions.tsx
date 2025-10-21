"use client";

import React, { useState, useEffect } from "react";
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
import { AssetManagerModal, type LibraryAsset } from "@envisio/ui";
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
  setSelectingPosition,
  setSelectedPosition,
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
    formData.append("bucketName", clientEnv.NEXT_PUBLIC_DO_SPACES_BUCKET);

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
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            reject(
              new Error(
                `Upload failed: ${errorResponse.error || xhr.statusText}`
              )
            );
          } catch {
            reject(
              new Error(
                `Upload failed with status ${xhr.status}: ${xhr.statusText}`
              )
            );
          }
        }
      });

      xhr.addEventListener("error", () => reject(new Error("Upload failed")));
      xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

      xhr.open("POST", "/api/s3-upload");
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
      let thumbnailUrl = null;
      if (data.screenshot) {
        const thumbnailBlob = dataURLtoBlob(data.screenshot);
        const thumbnailFileName = `${data.friendlyName}-thumbnail.png`;
        const thumbnailUpload = await uploadFileWithProgress(
          thumbnailBlob,
          thumbnailFileName,
          "image/png",
          null
        );
        thumbnailUrl = thumbnailUpload.url;
      }

      // Save model metadata to database
      const res = await fetch("/api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: modelUpload.key,
          originalFilename: data.file.name,
          name: data.friendlyName,
          fileType: data.file.type,
          thumbnail: thumbnailUrl,
          metadata: data.metadata,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create model record");
      }

      const { asset: newModel } = await res.json();
      showToast("Model uploaded and added to library!");
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
    // Check if this is a Cesium Ion asset
    const isCesiumAsset =
      (model as any).assetType === "cesiumIonAsset" ||
      (model as any).cesiumAssetId;

    if (isCesiumAsset) {
      // For Cesium Ion assets, add to both cesiumIonAssets and objects arrays
      addCesiumIonAsset({
        name: model.name || model.originalFilename,
        apiKey: (model as any).cesiumApiKey || "",
        assetId: (model as any).cesiumAssetId,
        enabled: true,
      });

      // Also add to objects array so it appears in scene objects list
      addModel({
        name: model.name || model.originalFilename,
        type: "cesium-ion-tileset",
        apiKey: (model as any).cesiumApiKey,
        assetId: (model as any).cesiumAssetId,
        position: [0, 0, 0], // Placeholder, actual position handled by Cesium
        scale: [1, 1, 1],
        rotation: [0, 0, 0],
      });

      setAssetManagerOpen(false);
      showToast(
        `Added Cesium Ion asset: ${model.name || model.originalFilename}`
      );
      return;
    }

    // For regular models, trigger positioning mode
    if (setPendingModel && setSelectingPosition && setSelectedPosition) {
      // Store the model temporarily and enter positioning mode
      setPendingModel({
        name: model.name || model.originalFilename,
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
        name: model.name || model.originalFilename,
        url: model.fileUrl,
        type: model.fileType,
        position: [0, 0, 0],
        scale: [1, 1, 1],
        rotation: [0, 0, 0],
      });
      showToast(`Added ${model.name || model.originalFilename} to scene`);
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

  // Handle asset update (name, description, metadata, thumbnail)
  const handleAssetUpdate = async (
    assetId: string,
    updates: {
      name?: string;
      description?: string;
      metadata?: Record<string, string>;
      thumbnail?: string;
    }
  ) => {
    try {
      const res = await fetch("/api/models/metadata", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId, ...updates }),
      });

      if (res.ok) {
        const data = await res.json();
        showToast("Asset updated successfully.");
        // Update local state with the returned asset data
        setUserAssets((prev) =>
          prev.map((asset) =>
            asset.id === assetId ? { ...asset, ...data.asset } : asset
          )
        );
      } else {
        const errorData = await res.json();
        console.error("Update failed:", errorData);
        showToast(
          `Failed to update asset: ${errorData.error || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Asset update error:", error);
      showToast("An error occurred while updating asset.");
    }
  };

  // Handle Cesium Ion asset addition
  const handleCesiumAssetAdd = async (data: {
    assetId: string;
    name: string;
    apiKey?: string;
  }) => {
    try {
      // Save to database
      const res = await fetch("/api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetType: "cesiumIonAsset",
          cesiumAssetId: data.assetId,
          cesiumApiKey: data.apiKey,
          name: data.name,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save Cesium Ion asset");
      }

      const { asset: newAsset } = await res.json();
      showToast(`Saved Cesium Ion asset: ${data.name}`);

      // Add to userAssets list
      setUserAssets((prev) => [...prev, newAsset]);

      // Add to scene store for immediate rendering (both arrays)
      addCesiumIonAsset({
        name: data.name,
        apiKey: data.apiKey || "",
        assetId: data.assetId,
        enabled: true,
      });

      // Also add to objects array so it appears in scene objects list
      addModel({
        name: data.name,
        type: "cesium-ion-tileset",
        apiKey: data.apiKey,
        assetId: data.assetId,
        position: [0, 0, 0], // Placeholder, actual position handled by Cesium
        scale: [1, 1, 1],
        rotation: [0, 0, 0],
      });
    } catch (error) {
      console.error("Cesium Ion asset save error:", error);
      showToast("An error occurred while saving Cesium Ion asset.");
    }
  };

  // Handle upload to Cesium Ion
  const handleUploadToIon = async (data: {
    file: File;
    name: string;
    description: string;
    sourceType: string;
    accessToken: string;
    longitude?: number;
    latitude?: number;
    height?: number;
    options?: {
      dracoCompression?: boolean;
      ktx2Compression?: boolean;
      webpImages?: boolean;
      geometricCompression?: string;
      epsgCode?: string;
      makeDownloadable?: boolean;
    };
  }): Promise<{ assetId: string }> => {
    setIonUploading(true);
    setIonUploadProgress(0);

    try {
      const {
        file,
        name,
        description,
        sourceType,
        accessToken,
        longitude,
        latitude,
        height,
        options,
      } = data;

      // Step 1: Create asset on Cesium Ion and get upload credentials (10% progress)
      setIonUploadProgress(10);

      // Map our sourceType to Cesium Ion's expected type and sourceType
      let ionType = sourceType;
      let uploadSourceType: string | undefined = undefined;

      // Handle the different asset types
      if (sourceType === "3DTILES" || sourceType === "GLTF") {
        ionType = sourceType;
        uploadSourceType = "3D_MODEL";
      } else if (sourceType === "3DTILES_BIM") {
        ionType = "3DTILES";
        uploadSourceType = "3D_MODEL"; // BIM/CAD models
      } else if (sourceType === "3DTILES_PHOTOGRAMMETRY") {
        ionType = "3DTILES";
        uploadSourceType = "3D_CAPTURE"; // Photogrammetry/Reality capture
      } else if (sourceType === "POINTCLOUD") {
        ionType = "3DTILES";
        uploadSourceType = "POINT_CLOUD";
      } else if (sourceType === "IMAGERY") {
        uploadSourceType = "RASTER_IMAGERY";
      } else if (sourceType === "TERRAIN") {
        uploadSourceType = "RASTER_TERRAIN";
      }

      // Build Ion-compatible options
      // Note: Compression options are typically set after upload via asset settings
      // During creation, we only send sourceType, position, and CRS
      const ionOptions: any = {};

      if (uploadSourceType) {
        ionOptions.sourceType = uploadSourceType;
      }

      // Add position if provided
      if (longitude !== undefined && latitude !== undefined) {
        ionOptions.position = { longitude, latitude, height: height || 0 };
      }

      // Add coordinate reference system if provided
      if (options?.epsgCode) {
        ionOptions.inputCrs = `EPSG:${options.epsgCode}`;
      }

      const createAssetResponse = await fetch("/api/ion-upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          type: ionType,
          accessToken,
          options: ionOptions,
        }),
      });

      if (!createAssetResponse.ok) {
        const errorData = await createAssetResponse.json();
        console.error("Cesium Ion API Error Response:", errorData);

        // Try to extract a meaningful error message
        let errorMessage =
          errorData.error || "Failed to create asset on Cesium Ion";
        if (errorData.details) {
          try {
            const details =
              typeof errorData.details === "string"
                ? JSON.parse(errorData.details)
                : errorData.details;
            if (details.message) {
              errorMessage = details.message;
            }
          } catch (e) {
            // details is already a string
            errorMessage = errorData.details;
          }
        }

        throw new Error(errorMessage);
      }

      const { assetId, uploadLocation, onComplete } =
        await createAssetResponse.json();

      // Derive assetId from prefix if missing (defensive fallback)
      const inferredId =
        assetId ??
        (() => {
          const match = /sources\/(\d+)\//.exec(uploadLocation?.prefix || "");
          return match ? Number(match[1]) : undefined;
        })();

      if (!inferredId) {
        throw new Error(
          "Ion response missing assetId and prefix; cannot proceed."
        );
      }

      // eslint-disable-next-line no-console
      console.log("📋 Asset ID:", inferredId);

      setIonUploadProgress(20);

      // Step 2: Upload file to S3 using AWS SDK with Ion's temporary credentials
      // uploadLocation contains { endpoint, bucket, prefix, accessKey, secretAccessKey, sessionToken }
      // eslint-disable-next-line no-console
      console.log("Uploading to S3 with credentials from Ion");
      // eslint-disable-next-line no-console
      console.log("Bucket:", uploadLocation.bucket);
      // eslint-disable-next-line no-console
      console.log("Key:", `${uploadLocation.prefix}${file.name}`);

      // Convert File to ArrayBuffer for AWS SDK compatibility
      const fileBuffer = await file.arrayBuffer();

      // Dynamically import AWS SDK (to avoid SSR issues)
      const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");

      const s3Client = new S3Client({
        region: "us-east-1", // Ion's upload bucket is in us-east-1
        endpoint: uploadLocation.endpoint,
        credentials: {
          accessKeyId: uploadLocation.accessKey,
          secretAccessKey: uploadLocation.secretAccessKey,
          sessionToken: uploadLocation.sessionToken,
        },
      });

      const s3Key = `${uploadLocation.prefix}${file.name}`;

      try {
        // Upload the file buffer to S3
        await s3Client.send(
          new PutObjectCommand({
            Bucket: uploadLocation.bucket,
            Key: s3Key,
            Body: new Uint8Array(fileBuffer),
            ContentType: file.type || "application/octet-stream",
          })
        );

        setIonUploadProgress(90);
      } catch (s3Error) {
        console.error("S3 upload error:", s3Error);
        throw new Error(
          `S3 upload failed: ${s3Error instanceof Error ? s3Error.message : "Unknown error"}`
        );
      }

      // Step 3: Notify Cesium Ion that upload is complete
      const completeResponse = await fetch("/api/ion-upload", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ onComplete, accessToken }),
      });

      if (!completeResponse.ok) {
        const errorData = await completeResponse.json();
        throw new Error(errorData.error || "Failed to complete upload");
      }

      setIonUploadProgress(100);

      // Log the asset details for easy access
      // eslint-disable-next-line no-console
      console.log("✅ Cesium Ion Upload Complete!");
      // eslint-disable-next-line no-console
      console.log("Asset ID:", inferredId);
      // eslint-disable-next-line no-console
      console.log(
        `View your asset at: https://ion.cesium.com/assets/${inferredId}`
      );

      showToast(`Successfully uploaded to Cesium Ion! Asset ID: ${inferredId}`);

      return { assetId: String(inferredId) };
    } catch (error) {
      console.error("Ion upload error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      showToast(`Cesium Ion upload failed: ${errorMessage}`);
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
        onAssetUpdate={handleAssetUpdate}
        // Upload Model
        onCustomModelUpload={handleCustomModelUpload}
        customModelUploading={uploading}
        customModelUploadProgress={uploadProgress}
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
