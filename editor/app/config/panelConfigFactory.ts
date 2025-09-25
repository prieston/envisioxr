import { PanelConfiguration } from "../types/panelConfig";
import {
  createThreeJSLeftPanelConfig,
  createCesiumLeftPanelConfig,
} from "./leftPanelConfig";
import {
  createThreeJSBottomPanelConfig,
  createCesiumBottomPanelConfig,
} from "./bottomPanelConfig";
import {
  createThreeJSRightPanelConfig,
  createCesiumRightPanelConfig,
} from "./rightPanelConfig";
import useWorldStore from "../hooks/useWorldStore";

export const getLeftPanelConfig = (
  gridEnabled: boolean,
  setGridEnabled: (enabled: boolean) => void,
  skyboxType: "default" | "none",
  setSkyboxType: (type: "default" | "none") => void,
  ambientLightIntensity: number,
  setAmbientLightIntensity: (intensity: number) => void,
  basemapType?: "cesium" | "google" | "google-photorealistic" | "bing" | "none",
  setBasemapType?: (
    type: "cesium" | "google" | "google-photorealistic" | "bing" | "none"
  ) => void
): PanelConfiguration => {
  const engine = useWorldStore.getState().engine;

  switch (engine) {
    case "three":
      return createThreeJSLeftPanelConfig(
        gridEnabled,
        setGridEnabled,
        skyboxType,
        setSkyboxType,
        ambientLightIntensity,
        setAmbientLightIntensity
      );
    case "cesium":
      return createCesiumLeftPanelConfig(
        gridEnabled,
        setGridEnabled,
        skyboxType,
        setSkyboxType,
        ambientLightIntensity,
        setAmbientLightIntensity,
        basemapType || "cesium",
        setBasemapType || (() => {})
      );
    default:
      return createThreeJSLeftPanelConfig(
        gridEnabled,
        setGridEnabled,
        skyboxType,
        setSkyboxType,
        ambientLightIntensity,
        setAmbientLightIntensity
      ); // Default to ThreeJS
  }
};

export const getBottomPanelConfig = (
  viewMode: string,
  setViewMode: (mode: string) => void,
  isPlaying: boolean,
  togglePlayback: () => void,
  observationPoints: any[],
  selectedObservation: any,
  addObservationPoint: () => void,
  selectObservation: (id: number) => void,
  nextObservation: () => void,
  prevObservation: () => void,
  previewMode: boolean,
  previewIndex: number,
  setPreviewIndex: (index: number) => void,
  setPreviewMode: (mode: boolean) => void
): PanelConfiguration => {
  const engine = useWorldStore.getState().engine;

  switch (engine) {
    case "three":
      return createThreeJSBottomPanelConfig(
        viewMode,
        setViewMode,
        isPlaying,
        togglePlayback,
        observationPoints,
        selectedObservation,
        addObservationPoint,
        selectObservation,
        nextObservation,
        prevObservation,
        previewMode,
        previewIndex,
        setPreviewIndex,
        setPreviewMode
      );
    case "cesium":
      return createCesiumBottomPanelConfig(
        viewMode,
        setViewMode,
        isPlaying,
        togglePlayback,
        observationPoints,
        selectedObservation,
        addObservationPoint,
        selectObservation,
        nextObservation,
        prevObservation,
        previewMode,
        previewIndex,
        setPreviewIndex,
        setPreviewMode
      );
    default:
      return createThreeJSBottomPanelConfig(
        viewMode,
        setViewMode,
        isPlaying,
        togglePlayback,
        observationPoints,
        selectedObservation,
        addObservationPoint,
        selectObservation,
        nextObservation,
        prevObservation,
        previewMode,
        previewIndex,
        setPreviewIndex,
        setPreviewMode
      ); // Default to ThreeJS
  }
};

export const getRightPanelConfig = (
  selectedObject: any,
  selectedObservation: any,
  viewMode: string,
  controlSettings: any,
  updateObjectProperty: (id: string, property: string, value: any) => void,
  updateObservationPoint: (id: number, update: any) => void,
  deleteObservationPoint: (id: number) => void,
  setCapturingPOV: (val: boolean) => void,
  updateControlSettings: (update: any) => void,
  // Asset library props
  tabIndex: number,
  setTabIndex: (index: number) => void,
  userAssets: any[],
  deletingAssetId: string | null,
  handleDeleteModel: (assetId: string) => Promise<void>,
  handleModelSelect: (model: any) => void,
  selectingPosition: boolean,
  setSelectingPosition: (selecting: boolean) => void,
  selectedPosition: [number, number, number] | null,
  pendingModel: any,
  handleConfirmModelPlacement: () => void,
  handleCancelModelPlacement: () => void,
  previewUrl: string | null,
  setPreviewUrl: (url: string | null) => void,
  previewFile: File | null,
  setPreviewFile: (file: File | null) => void,
  screenshot: string | null,
  setScreenshot: (screenshot: string | null) => void,
  friendlyName: string,
  setFriendlyName: (name: string) => void,
  uploading: boolean,
  uploadProgress: number,
  isConfirmDisabled: boolean,
  handleConfirmUpload: () => void,
  getRootProps: any,
  getInputProps: any,
  metadata: any[],
  setMetadata: (metadata: any[]) => void,
  isObservationModel: boolean,
  onObservationModelChange: (isObservationModel: boolean) => void,
  observationProperties: any,
  onObservationPropertiesChange: (properties: any) => void
): PanelConfiguration => {
  const engine = useWorldStore.getState().engine;

  switch (engine) {
    case "three":
      return createThreeJSRightPanelConfig(
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
        onObservationModelChange,
        observationProperties,
        onObservationPropertiesChange
      );
    case "cesium":
      return createCesiumRightPanelConfig(
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
        onObservationModelChange,
        observationProperties,
        onObservationPropertiesChange
      );
    default:
      return createThreeJSRightPanelConfig(
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
        onObservationModelChange,
        observationProperties,
        onObservationPropertiesChange
      ); // Default to ThreeJS
  }
};

// Note: legacy getPanelConfig has been removed in favor of explicit
// getLeftPanelConfig/getRightPanelConfig/getBottomPanelConfig which
// accept required state parameters and route by engine.
