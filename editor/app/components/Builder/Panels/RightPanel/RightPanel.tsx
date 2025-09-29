"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Tabs, Tab } from "@mui/material";
import { useDropzone } from "react-dropzone";
import { showToast } from "@envisio/core/utils";
import * as THREE from "three";
import * as Cesium from "cesium";

import { clientEnv } from "@/lib/env/client";
import { useSceneStore, useWorldStore } from "@envisio/core/state";
import { getRightPanelConfig } from "@envisio/config/factory";
import SettingRenderer from "./SettingRenderer";
import { getPositionAtScreenPoint } from "@envisio/core/utils";

import { RightPanelContainer, TabPanel } from "./RightPanel.styles";

const RightPanelNew: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [tabIndex, setTabIndex] = useState(0);
  const [userAssets, setUserAssets] = useState<any[]>([]);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [friendlyName, setFriendlyName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deletingAssetId, setDeletingAssetId] = useState<string | null>(null);
  const [selectingPosition, setSelectingPosition] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<
    [number, number, number] | null
  >(null);
  const [pendingModel, setPendingModel] = useState<any>(null);
  const [metadata, setMetadata] = useState<any[]>([]);
  const [isObservationModel, setIsObservationModel] = useState(false);
  const [observationProperties, setObservationProperties] = useState({
    fov: 90,
    showVisibleArea: false,
    visibilityRadius: 100,
  });

  const { previewMode } = useSceneStore();
  const { engine } = useWorldStore();

  // Setup dropzone for file uploads
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "model/gltf-binary": [".glb"],
      "model/gltf+json": [".gltf"],
      "model/obj": [".obj"],
      "model/fbx": [".fbx"],
      "model/collada": [".dae"],
    },
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setPreviewFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setFriendlyName(file.name.replace(/\.[^/.]+$/, "")); // Remove extension
      }
    },
    maxFiles: 1,
  });

  // Calculate if confirm button should be disabled
  const isConfirmDisabled = !previewFile || !friendlyName.trim() || uploading;

  // Get all the state values and setters that the configuration depends on
  const {
    selectedObject,
    selectedObservation,
    viewMode,
    controlSettings,
    updateObjectProperty,
    updateObservationPoint,
    deleteObservationPoint,
    setCapturingPOV,
    updateControlSettings,
    addModel,
    orbitControlsRef,
    scene,
  } = useSceneStore();

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

  // Handle position selection mode
  useEffect(() => {
    if (!selectingPosition) return;
    if (viewMode === "firstPerson") return;

    const { cesiumViewer } = useSceneStore.getState();

    // THREE.JS BRANCH (DOM listener on renderer canvas)
    if (engine === "three") {
      const canvas: HTMLCanvasElement =
        // if you keep a renderer ref, use it here instead of querySelector
        ((scene as any)?.renderer?.domElement as HTMLCanvasElement) ||
        (document.querySelector("canvas") as HTMLCanvasElement);

      if (!canvas || !orbitControlsRef || !scene) return;

      const handleClick = (event: MouseEvent) => {
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        const mouse = new THREE.Vector2(
          ((event.clientX - rect.left) / rect.width) * 2 - 1,
          -((event.clientY - rect.top) / rect.height) * 2 + 1
        );
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, (orbitControlsRef as any).object);

        const all: THREE.Object3D[] = [];
        scene.traverse((o) => ((o as THREE.Mesh).isMesh ? all.push(o) : null));
        const hits = raycaster.intersectObjects(all, true);

        if (hits.length > 0) {
          const p = hits[0].point;
          setSelectedPosition([p.x, p.y, p.z]);
          showToast("Position set!");
        } else {
          showToast("No surface detected at click point");
        }
      };

      canvas.addEventListener("click", handleClick);
      const prev = canvas.style.cursor;
      canvas.style.cursor = "crosshair";

      return () => {
        canvas.removeEventListener("click", handleClick);
        canvas.style.cursor = prev || "auto";
      };
    }

    // CESIUM BRANCH (ScreenSpaceEventHandler on Cesium canvas)
    if (engine === "cesium" && cesiumViewer) {
      const handler = new Cesium.ScreenSpaceEventHandler(cesiumViewer.canvas);

      handler.setInputAction((movement: any) => {
        const pos = movement.position; // window coords
        const res = getPositionAtScreenPoint(cesiumViewer, pos.x, pos.y, {
          prefer3DTiles: true,
          preferTerrain: true,
          maxTerrainDistance: 5000,
          fallbackToEllipsoid: true,
        });

        if (res) {
          const [lon, lat, h] = res.position;
          setSelectedPosition([lon, lat, h]);
          showToast(`Position set on ${res.surfaceType} (${res.accuracy})`);
        } else {
          showToast("No surface detected at click point");
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      const prev = cesiumViewer.canvas.style.cursor;
      cesiumViewer.canvas.style.cursor = "crosshair";

      return () => {
        handler.destroy();
        cesiumViewer.canvas.style.cursor = prev || "auto";
      };
    }
  }, [selectingPosition, engine, viewMode, orbitControlsRef, scene]);

  const handleModelSelect = (model: any) => {
    // Store the model temporarily
    const pendingModel = {
      name: model.name,
      assetId: model.assetId,
      url: model.url,
      type: model.type,
      position: [0, 0, 0], // Default position, will be updated on click
      scale: [1, 1, 1],
      rotation: [0, 0, 0],
    };

    // Show confirmation UI
    setPendingModel(pendingModel);
    setSelectingPosition(true);
    showToast("Click anywhere in the scene to select the insertion point");
  };

  const handleDeleteModel = async (assetId) => {
    setDeletingAssetId(assetId);
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
    } finally {
      setDeletingAssetId(null);
    }
  };

  const dataURLtoBlob = (dataurl) => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const uploadFileWithProgress = async (
    file: File | Blob,
    fileName: string,
    fileType: string,
    onProgress: (progress: number) => void
  ): Promise<{ key: string; publicUrl: string }> => {
    const patchRes = await fetch("/api/models", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName, fileType }),
    });
    if (!patchRes.ok) {
      throw new Error(`Failed to get signed URL for ${fileName}`);
    }
    const { signedUrl, key } = await patchRes.json();

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", signedUrl);
      xhr.setRequestHeader("Content-Type", fileType);
      xhr.setRequestHeader("x-amz-acl", "public-read");

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percentCompleted = Math.round(
            (event.loaded / event.total) * 100
          );
          onProgress(percentCompleted);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const endpoint = clientEnv.NEXT_PUBLIC_DO_SPACES_ENDPOINT;
          const publicUrl = `${endpoint}/${key}`;
          resolve({ key, publicUrl });
        } else {
          reject(new Error("Upload failed with status " + xhr.status));
        }
      };

      xhr.onerror = () => reject(new Error("File upload failed (XHR error)"));
      xhr.send(file);
    });
  };

  const handleConfirmUpload = async () => {
    if (!previewFile || !screenshot || !friendlyName) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const modelUpload = await uploadFileWithProgress(
        previewFile,
        previewFile.name,
        previewFile.type,
        setUploadProgress
      );
      const thumbnailBlob = dataURLtoBlob(screenshot);
      const thumbnailFileName = friendlyName + "-thumbnail.png";
      const thumbnailUpload = await uploadFileWithProgress(
        thumbnailBlob,
        thumbnailFileName,
        "image/png",
        null
      );

      // Add observation model properties to metadata if it's an observation model
      const metadataWithObservation = isObservationModel
        ? [
            ...metadata,
            { label: "isObservationModel", value: "true" },
            { label: "fov", value: observationProperties.fov.toString() },
            {
              label: "visibilityRadius",
              value: observationProperties.visibilityRadius.toString(),
            },
          ]
        : metadata;

      const postRes = await fetch("/api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: modelUpload.key,
          originalFilename: friendlyName,
          fileType: previewFile.type,
          thumbnail: thumbnailUpload.publicUrl,
          metadata: metadataWithObservation,
        }),
      });
      if (!postRes.ok) {
        showToast("Failed to record the uploaded file.");
        return;
      }
      const postData = await postRes.json();
      showToast(`Uploaded ${friendlyName} successfully.`);

      // Add the new model to the userAssets list
      const newModel = {
        id: postData.asset.id,
        originalFilename: friendlyName,
        fileUrl: postData.asset.fileUrl,
        fileType: previewFile.type,
        thumbnail: thumbnailUpload.publicUrl,
        metadata: metadataWithObservation.reduce((acc, item) => {
          acc[item.label] = item.value;
          return acc;
        }, {}),
      };
      setUserAssets((prev) => [...prev, newModel]);

      handleModelSelect({
        name: friendlyName,
        url: postData.asset.fileUrl,
        type: previewFile.type,
        isObservationModel,
        observationProperties: isObservationModel
          ? observationProperties
          : undefined,
      });
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
    } catch (error) {
      console.error("Upload error:", error);
      showToast("An error occurred during upload.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Add new handler for confirming model placement
  const handleConfirmModelPlacement = () => {
    if (pendingModel && selectedPosition) {
      // Store the coordinates as-is - Cesium coordinates for Cesium, local coordinates for Three.js
      if (process.env.NODE_ENV === "development") {
        console.log(
          `[RightPanel] Adding model with position:`,
          selectedPosition,
          `Engine:`,
          engine
        );
      }

      addModel({
        ...pendingModel,
        position: selectedPosition,
        isObservationModel: pendingModel.isObservationModel || false,
        observationProperties: pendingModel.isObservationModel
          ? {
              fov: pendingModel.observationProperties?.fov || 90,
              showVisibleArea:
                pendingModel.observationProperties?.showVisibleArea || false,
              visibilityRadius:
                pendingModel.observationProperties?.visibilityRadius || 100,
            }
          : undefined,
      });
      setPendingModel(null);
      setSelectedPosition(null);
      setSelectingPosition(false);
    }
  };

  // Add new handler for canceling model placement
  const handleCancelModelPlacement = () => {
    setPendingModel(null);
    setSelectedPosition(null);
    setSelectingPosition(false);
  };

  // Recreate configuration whenever state changes
  const config = useMemo(() => {
    return getRightPanelConfig(
      selectedObject,
      selectedObservation,
      viewMode,
      controlSettings,
      updateObjectProperty,
      updateObservationPoint,
      deleteObservationPoint,
      setCapturingPOV,
      updateControlSettings,
      tabIndex,
      setTabIndex,
      userAssets,
      deletingAssetId,
      handleDeleteModel,
      handleModelSelect,
      selectingPosition,
      setSelectingPosition,
      selectedPosition,
      pendingModel,
      handleConfirmModelPlacement,
      handleCancelModelPlacement,
      previewUrl,
      setPreviewUrl,
      previewFile,
      setPreviewFile,
      screenshot,
      setScreenshot,
      friendlyName,
      setFriendlyName,
      uploading,
      uploadProgress,
      isConfirmDisabled,
      handleConfirmUpload,
      getRootProps,
      getInputProps,
      metadata,
      setMetadata,
      isObservationModel,
      setIsObservationModel,
      observationProperties,
      setObservationProperties
    );
  }, [
    engine,
    selectedObject,
    selectedObservation,
    viewMode,
    controlSettings,
    updateObjectProperty,
    updateObservationPoint,
    deleteObservationPoint,
    setCapturingPOV,
    updateControlSettings,
    tabIndex,
    userAssets,
    deletingAssetId,
    selectingPosition,
    selectedPosition,
    pendingModel,
    previewUrl,
    previewFile,
    screenshot,
    friendlyName,
    uploading,
    uploadProgress,
    isConfirmDisabled,
    metadata,
    isObservationModel,
    observationProperties,
  ]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    if (newValue === 1) {
      setTabIndex(0); // Reset to first tab when switching to Assets
      // Reset upload state
      setPreviewFile(null);
      setPreviewUrl(null);
      setScreenshot(null);
      setFriendlyName("");
    }
  };

  const currentTab = config.tabs[activeTab];

  return (
    <RightPanelContainer previewMode={previewMode} className="glass-panel">
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          flexShrink: 0,
          mb: 1,
          minHeight: "32px",
          "& .MuiTab-root": {
            color: "text.secondary",
            minHeight: "32px",
            padding: "4px 8px",
            fontSize: "0.875rem",
            flexDirection: "row",
            gap: "4px",
            marginBottom: "6px",
            "&.Mui-selected": {
              color: "primary.main",
            },
            "& .MuiSvgIcon-root": {
              marginBottom: 0,
            },
          },
          "& .MuiTabs-indicator": {
            height: "2px",
          },
        }}
      >
        {config.tabs.map((tab) => (
          <Tab
            key={tab.id}
            icon={tab.icon ? <tab.icon /> : undefined}
            label={tab.label}
            sx={{ textTransform: "none" }}
          />
        ))}
      </Tabs>

      <TabPanel>
        {currentTab.settings.map((setting) => (
          <SettingRenderer key={setting.id} setting={setting} />
        ))}
      </TabPanel>
    </RightPanelContainer>
  );
};

export default RightPanelNew;
