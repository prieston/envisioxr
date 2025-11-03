import { useState, useEffect } from "react";
import { showToast } from "@envisio/ui";
import { useSceneStore } from "@envisio/core";
import { dataURLtoBlob } from "@envisio/ui";
import { clientEnv } from "@/lib/env/client";
import type { LibraryAsset } from "@envisio/ui";

interface UseAssetManagerProps {
  setSelectingPosition?: (selecting: boolean) => void;
  setSelectedPosition?: (position: [number, number, number] | null) => void;
  setPendingModel?: (model: any) => void;
}

export const useAssetManager = ({
  setSelectingPosition,
  setSelectedPosition,
  setPendingModel,
}: UseAssetManagerProps) => {
  const [userAssets, setUserAssets] = useState<LibraryAsset[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const addCesiumIonAsset = useSceneStore((s) => s.addCesiumIonAsset);
  const addModel = useSceneStore((state) => state.addModel);

  // Fetch user's uploaded models when component mounts
  useEffect(() => {
    fetchUserAssets();
  }, []);

  const fetchUserAssets = () => {
    fetch("/api/models")
      .then((res) => res.json())
      .then((data) => {
        setUserAssets(data.assets || []);
      })
      .catch((err) => {
        console.error("Error fetching models:", err);
        showToast("Failed to load models");
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
      // Step 1: Get presigned URL for model file
      const signedUrlResponse = await fetch("/api/models", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: data.file.name,
          fileType: data.file.type,
        }),
      });

      if (!signedUrlResponse.ok) {
        throw new Error("Failed to get signed URL");
      }

      const { signedUrl, key, acl } = await signedUrlResponse.json();

      // Step 2: Upload model file directly to S3 using presigned URL
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round(
              (event.loaded / event.total) * 100
            );
            setUploadProgress(percentComplete);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => reject(new Error("Upload failed")));
        xhr.open("PUT", signedUrl);
        xhr.setRequestHeader("Content-Type", data.file.type);
        if (acl) {
          xhr.setRequestHeader("x-amz-acl", acl);
        }
        xhr.send(data.file);
      });

      // Upload thumbnail if available (using presigned URL)
      let thumbnailUrl = null;
      if (data.screenshot) {
        const thumbnailBlob = dataURLtoBlob(data.screenshot);
        const thumbnailFileName = `${data.friendlyName}-thumbnail.png`;

        // Get presigned URL for thumbnail
        const thumbSignedUrlResponse = await fetch("/api/models", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: thumbnailFileName,
            fileType: "image/png",
          }),
        });

        if (thumbSignedUrlResponse.ok) {
          const {
            signedUrl: thumbSignedUrl,
            key: thumbKey,
            acl: thumbAcl,
          } = await thumbSignedUrlResponse.json();

          // Upload thumbnail directly to S3
          const headers: Record<string, string> = {
            "Content-Type": "image/png",
          };
          if (thumbAcl) {
            headers["x-amz-acl"] = thumbAcl;
          }

          await fetch(thumbSignedUrl, {
            method: "PUT",
            headers,
            body: thumbnailBlob,
          });

          // Construct thumbnail URL
          thumbnailUrl = `${clientEnv.NEXT_PUBLIC_DO_SPACES_ENDPOINT}/${clientEnv.NEXT_PUBLIC_DO_SPACES_BUCKET}/${thumbKey}`;
        }
      }

      // Step 3: Save model metadata to database
      const res = await fetch("/api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: key,
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

  return {
    userAssets,
    uploading,
    uploadProgress,
    handleCustomModelUpload,
    handleModelSelect,
    handleDeleteModel,
    handleAssetUpdate,
    fetchUserAssets,
  };
};
