"use client";

import React, { useState, useEffect, useMemo } from "react";
import { styled } from "@mui/material/styles";
import { Box, Tabs, Tab } from "@mui/material";
import { useDropzone } from "react-dropzone";
import { showToast } from "@/app/utils/toastUtils";
import * as THREE from "three";
import { clientEnv } from "@/lib/env/client";
import useSceneStore from "../../hooks/useSceneStore";
import useWorldStore from "../../hooks/useWorldStore";
import { getRightPanelConfig } from "../../config/panelConfigFactory";
import SettingRenderer from "./SettingRenderer";

// Styled container for the RightPanel with conditional styles based on previewMode
interface RightPanelContainerProps {
  previewMode: boolean;
}

const RightPanelContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== "previewMode",
})<RightPanelContainerProps>(({ theme, previewMode }) => ({
  width: "400px",
  height: "100%",
  backgroundColor: "#121212",
  color: theme.palette.text.primary,
  padding: theme.spacing(2),
  borderLeft: "1px solid rgba(255, 255, 255, 0.08)",
  userSelect: "none",
  pointerEvents: previewMode ? "none" : "auto",
  opacity: previewMode ? 0.5 : 1,
  cursor: previewMode ? "not-allowed" : "default",
  filter: previewMode ? "grayscale(100%)" : "none",
  transition: "all 0.3s ease",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
}));

const TabPanel = styled(Box)(({ theme }) => ({
  flex: 1,
  overflow: "auto",
  paddingBottom: theme.spacing(2),
}));

const RightPanelNew: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [tabIndex, setTabIndex] = useState(0);
  const [userAssets, setUserAssets] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [screenshot, setScreenshot] = useState(null);
  const [friendlyName, setFriendlyName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deletingAssetId, setDeletingAssetId] = useState(null);
  const [selectingPosition, setSelectingPosition] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<
    [number, number, number] | null
  >(null);
  const [pendingModel, setPendingModel] = useState(null);
  const [metadata, setMetadata] = useState([]);
  const [isObservationModel, setIsObservationModel] = useState(false);
  const [observationProperties, setObservationProperties] = useState({
    fov: 90,
    showVisibleArea: false,
    visibilityRadius: 100,
  });

  const { previewMode } = useSceneStore();
  const { engine } = useWorldStore();

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
    if (!selectingPosition || !orbitControlsRef || !scene) return;

    const handleClick = (event) => {
      const rect = event.target.getBoundingClientRect();
      const mouse = new THREE.Vector2();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Update the raycaster
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, orbitControlsRef.object);

      // Get all objects in the scene
      const allObjects = [];
      scene.traverse((object) => {
        if ((object as THREE.Mesh).isMesh) {
          allObjects.push(object);
        }
      });

      // Find intersections with all objects
      const intersects = raycaster.intersectObjects(allObjects, true);

      if (intersects.length > 0) {
        const hitPoint = intersects[0].point;
        setSelectedPosition([hitPoint.x, hitPoint.y, hitPoint.z]);
        setSelectingPosition(false); // Close the first box
        showToast("Position selected!");
      } else {
        showToast("No surface detected at click point");
      }
    };

    const canvas = document.querySelector("canvas");
    if (canvas) {
      canvas.addEventListener("click", handleClick);
      canvas.style.cursor = "crosshair";
    } else {
      console.log("Canvas element not found");
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener("click", handleClick);
        canvas.style.cursor = "auto";
      }
    };
  }, [selectingPosition, orbitControlsRef, scene]);

  // Add a new effect to handle position updates after initial selection
  useEffect(() => {
    if (!selectedPosition || !orbitControlsRef || !scene) return;

    const handleClick = (event) => {
      const rect = event.target.getBoundingClientRect();
      const mouse = new THREE.Vector2();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, orbitControlsRef.object);

      const allObjects = [];
      scene.traverse((object) => {
        if ((object as THREE.Mesh).isMesh) {
          allObjects.push(object);
        }
      });

      const intersects = raycaster.intersectObjects(allObjects, true);
      if (intersects.length > 0) {
        const hitPoint = intersects[0].point;
        setSelectedPosition([hitPoint.x, hitPoint.y, hitPoint.z]);
        showToast("Position updated!");
      }
    };

    const canvas = document.querySelector("canvas");
    if (canvas) {
      canvas.addEventListener("click", handleClick);
      canvas.style.cursor = "crosshair";
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener("click", handleClick);
        canvas.style.cursor = "auto";
      }
    };
  }, [selectedPosition, orbitControlsRef, scene]);

  const handleModelSelect = (model) => {
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

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "model/gltf-binary": [".glb"] },
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const objectUrl = URL.createObjectURL(file);
        setPreviewFile(file);
        setPreviewUrl(objectUrl);
        setScreenshot(null);
      }
    },
  });

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

  const isConfirmDisabled = !screenshot || !friendlyName || uploading;

  // Add new handler for confirming model placement
  const handleConfirmModelPlacement = () => {
    if (pendingModel && selectedPosition) {
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
    <RightPanelContainer previewMode={previewMode}>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          flexShrink: 0,
          "& .MuiTab-root": {
            color: "text.secondary",
            "&.Mui-selected": {
              color: "primary.main",
            },
          },
        }}
      >
        {config.tabs.map((tab) => (
          <Tab key={tab.id} label={tab.label} sx={{ textTransform: "none" }} />
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
