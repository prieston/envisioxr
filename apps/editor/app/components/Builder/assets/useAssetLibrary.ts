"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { showToast } from "@envisio/ui";
import {
  getModels,
  deleteModel,
  getModelUploadUrl,
  getThumbnailUploadUrl,
  uploadToSignedUrl,
  createModelAsset,
  createCesiumIonAsset,
} from "@/app/utils/api";

interface AssetModel {
  id: string;
  name: string;
  url: string;
  fileUrl?: string;
  fileType?: string;
  type?: string;
  assetId?: string;
  thumbnail?: string;
  originalFilename?: string;
  metadata?: Record<string, unknown>;
  assetType?: string;
}

interface Asset {
  id: string;
  name?: string;
  originalFilename: string;
  fileUrl: string;
  fileType: string;
  assetType?: string;
  thumbnail?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  cesiumAssetId?: string;
}

interface StockModel {
  name: string;
  url: string;
  type: string;
}

interface MetadataField {
  label: string;
  value: string;
}

export const useAssetLibrary = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [stockModels, setStockModels] = useState<StockModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingAssetId, setDeletingAssetId] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  // Upload state
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [friendlyName, setFriendlyName] = useState("");
  const [metadata, setMetadata] = useState<MetadataField[]>([]);
  const [isObservationModel, setIsObservationModel] = useState(false);
  const [observationProperties, setObservationProperties] = useState({
    fov: 90,
    showVisibleArea: false,
    visibilityRadius: 100,
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchAssets = useCallback(async () => {
    try {
      const data = await getModels();
      setAssets(data.assets || []);
      setStockModels(data.stockModels || []);
    } catch (error) {
      console.error("Error fetching assets:", error);
      showToast("Failed to load assets", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // Cleanup: Abort XHR request and mark component as unmounted
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (xhrRef.current) {
        xhrRef.current.abort();
        xhrRef.current = null;
      }
    };
  }, []);

  const handleDelete = useCallback(async (assetId: string) => {
    if (!confirm("Are you sure you want to delete this asset?")) return;

    setDeletingAssetId(assetId);
    try {
      await deleteModel(assetId);
      setAssets((prev) => prev.filter((asset) => asset.id !== assetId));
      showToast("Asset deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting asset:", error);
      showToast("Failed to delete asset", "error");
    } finally {
      setDeletingAssetId(null);
    }
  }, []);

  // Dropzone handlers
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setPreviewFile(file);
      setFriendlyName(file.name.replace(/\.[^/.]+$/, ""));

      // Create preview URL for GLB/GLTF files
      if (
        file.type.includes("gltf") ||
        file.name.endsWith(".glb") ||
        file.name.endsWith(".gltf")
      ) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "model/gltf-binary": [".glb"],
      "model/gltf+json": [".gltf"],
    },
    multiple: false,
  });

  const handleCancelUpload = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewFile(null);
    setPreviewUrl(null);
    setScreenshot(null);
    setFriendlyName("");
    setMetadata([]);
    setIsObservationModel(false);
    setObservationProperties({
      fov: 90,
      showVisibleArea: false,
      visibilityRadius: 100,
    });
  }, [previewUrl]);

  const isConfirmDisabled = !friendlyName || !screenshot;

  const handleConfirmUpload = useCallback(async () => {
    if (!previewFile || !friendlyName) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Get presigned URL for model file
      const { signedUrl, key, acl } = await getModelUploadUrl({
        fileName: previewFile.name,
        fileType: previewFile.type,
      });

      // Step 2: Upload model file directly to S3 using presigned URL
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;

        const handleProgress = (
          event: ProgressEvent<XMLHttpRequestEventTarget>
        ) => {
          if (!isMountedRef.current) return;
          if (event.lengthComputable) {
            const percentComplete = Math.round(
              (event.loaded / event.total) * 100
            );
            setUploadProgress(percentComplete);
          }
        };

        const handleLoad = () => {
          if (!isMountedRef.current) return;
          // Cleanup event listeners
          xhr.upload.removeEventListener("progress", handleProgress);
          xhr.removeEventListener("load", handleLoad);
          xhr.removeEventListener("error", handleError);
          xhrRef.current = null;

          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };

        const handleError = () => {
          if (!isMountedRef.current) return;
          // Cleanup event listeners
          xhr.upload.removeEventListener("progress", handleProgress);
          xhr.removeEventListener("load", handleLoad);
          xhr.removeEventListener("error", handleError);
          xhrRef.current = null;
          reject(new Error("Upload failed"));
        };

        xhr.upload.addEventListener("progress", handleProgress);
        xhr.addEventListener("load", handleLoad);
        xhr.addEventListener("error", handleError);
        xhr.open("PUT", signedUrl);
        xhr.setRequestHeader("Content-Type", previewFile.type);
        if (acl) {
          xhr.setRequestHeader("x-amz-acl", acl);
        }
        xhr.send(previewFile);
      });

      // Upload thumbnail if available
      let thumbnailUrl = null;
      if (screenshot) {
        // Fetch screenshot blob - this is an external URL fetch, but we'll keep it simple
        const response = await fetch(screenshot);
        const blob = await response.blob();
        const { signedUrl: thumbnailSignedUrl, acl: thumbnailAcl } =
          await getThumbnailUploadUrl({
            fileName: `thumbnails/${key.replace(/\.(glb|gltf)$/, ".jpg")}`,
            fileType: "image/jpeg",
          });
        await uploadToSignedUrl(thumbnailSignedUrl, blob, {
          contentType: "image/jpeg",
          acl: thumbnailAcl,
        });
        thumbnailUrl = thumbnailSignedUrl.split("?")[0];
      }

      // Step 3: Create asset record in database
      const metadataObject =
        metadata?.reduce(
          (acc: Record<string, string>, field: MetadataField) => {
            if (field.label && field.value) {
              acc[field.label] = field.value;
            }
            return acc;
          },
          {}
        ) || {};

      const metadataWithObservation = {
        ...metadataObject,
        ...(isObservationModel ? { observationProperties } : {}),
      };

      await createModelAsset({
        key,
        originalFilename: previewFile.name,
        name: friendlyName,
        fileType: previewFile.type.includes("gltf")
          ? previewFile.type.includes("json")
            ? "gltf"
            : "glb"
          : previewFile.type,
        thumbnail: thumbnailUrl,
        metadata: metadataWithObservation,
      });

      showToast("Model uploaded successfully", "success");
      handleCancelUpload();
      fetchAssets();
      setTabIndex(0); // Switch to "Your Models" tab
    } catch (error) {
      console.error("Upload error:", error);
      showToast(
        error instanceof Error ? error.message : "Upload failed",
        "error"
      );
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [
    previewFile,
    friendlyName,
    screenshot,
    metadata,
    isObservationModel,
    observationProperties,
    handleCancelUpload,
    fetchAssets,
  ]);

  const handleCesiumAssetAdd = useCallback(
    async (data: { assetId: string; name: string; apiKey?: string }) => {
      try {
        await createCesiumIonAsset({
          assetType: "cesiumIonAsset",
          cesiumAssetId: data.assetId,
          cesiumApiKey: data.apiKey,
          name: data.name,
        });

        showToast("Ion asset added successfully", "success");
        fetchAssets();
        setTabIndex(0); // Switch to "Your Models" tab
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to add Ion asset";
        showToast(errorMessage, "error");
        throw error;
      }
    },
    [fetchAssets]
  );

  // Combine stock models and assets for display
  const allAssets: AssetModel[] = [
    ...stockModels.map(
      (model): AssetModel => ({
        id: `stock-${model.name}`,
        name: model.name,
        url: model.url,
        originalFilename: model.name,
        fileUrl: model.url,
        fileType: model.type,
        type: model.type,
        assetType: "stock",
      })
    ),
    ...assets.map(
      (asset): AssetModel => ({
        id: asset.id,
        name: asset.name || asset.originalFilename,
        url: asset.fileUrl,
        originalFilename: asset.originalFilename,
        fileUrl: asset.fileUrl,
        fileType: asset.fileType,
        type: asset.fileType,
        assetId: asset.id,
        thumbnail: asset.thumbnail,
        metadata: asset.metadata,
      })
    ),
  ];

  return {
    // State
    tabIndex,
    setTabIndex,
    assets: allAssets,
    loading,
    deletingAssetId,
    // Upload state
    previewUrl,
    setPreviewUrl,
    previewFile,
    setPreviewFile,
    screenshot,
    setScreenshot,
    friendlyName,
    setFriendlyName,
    metadata,
    setMetadata,
    isObservationModel,
    setIsObservationModel,
    observationProperties,
    setObservationProperties,
    uploading,
    uploadProgress,
    isConfirmDisabled,
    getRootProps,
    getInputProps,
    // Actions
    handleDelete,
    handleConfirmUpload,
    handleCancelUpload,
    handleCesiumAssetAdd,
    fetchAssets,
  };
};
