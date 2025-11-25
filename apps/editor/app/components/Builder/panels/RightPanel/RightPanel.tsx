"use client";

import React, { useMemo } from "react";
import { Box } from "@mui/material";
import { useSceneStore, useWorldStore } from "@klorad/core";
import { getRightPanelConfig } from "@klorad/config/factory";
import { RightPanelContainer, GenericPanel } from "@klorad/ui";
import SettingRenderer from "../../SettingRenderer";
import BuilderActions from "@/app/components/AppBar/BuilderActions";

interface RightPanelProps {
  onSave?: () => Promise<void>;
  onPublish?: () => void;
  projectId?: string;
  projectThumbnail?: string | null;
  onThumbnailUpdate?: () => void;
  selectingPosition?: boolean;
  setSelectingPosition?: (selecting: boolean) => void;
  selectedPosition?: [number, number, number] | null;
  setSelectedPosition?: (position: [number, number, number] | null) => void;
  pendingModel?: any;
  setPendingModel?: (model: any) => void;
  repositioning?: boolean;
  onStartRepositioning?: (objectId: string) => void;
  onCancelRepositioning?: () => void;
}

const RightPanel: React.FC<RightPanelProps> = ({
  onSave,
  onPublish,
  projectId,
  projectThumbnail,
  onThumbnailUpdate,
  selectingPosition,
  setSelectingPosition,
  selectedPosition,
  setSelectedPosition,
  pendingModel,
  setPendingModel,
  repositioning,
  onStartRepositioning,
  onCancelRepositioning,
}) => {
  // Combine all scene store subscriptions into a single selector to reduce subscriptions from 10 to 1
  const sceneState = useSceneStore((state) => ({
    previewMode: state.previewMode,
    selectedObservation: state.selectedObservation,
    viewMode: state.viewMode,
    controlSettings: state.controlSettings,
    updateObjectProperty: state.updateObjectProperty,
    updateObservationPoint: state.updateObservationPoint,
    deleteObservationPoint: state.deleteObservationPoint,
    setCapturingPOV: state.setCapturingPOV,
    updateControlSettings: state.updateControlSettings,
    // For selectedObject, exclude weatherData to prevent re-renders when IoT updates
    selectedObject: state.selectedObject
      ? (() => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { weatherData, ...rest } = state.selectedObject;
          return rest;
        })()
      : null,
  }));

  const { engine } = useWorldStore();

  // Destructure for cleaner lookups
  const {
    previewMode,
    selectedObservation,
    viewMode,
    controlSettings,
    updateObjectProperty,
    updateObservationPoint,
    deleteObservationPoint,
    setCapturingPOV,
    updateControlSettings,
    selectedObject,
  } = sceneState;

  // Memoize only on object ID change, not full object to prevent scroll resets
  const selectedObjectId = selectedObject?.id;

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
      {
        engine,
        repositioning,
        onStartRepositioning,
        onCancelRepositioning,
      }
    );
    // Only depend on object ID, not the full object to prevent unnecessary re-renders
    // Zustand setters are stable and don't need to be in dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    engine,
    selectedObjectId,
    selectedObservation,
    viewMode,
    controlSettings,
    repositioning,
    onStartRepositioning,
    onCancelRepositioning,
  ]);

  return (
    <RightPanelContainer
      previewMode={previewMode}
      className="glass-panel"
      sx={{ maxHeight: "none !important", height: "calc(100vh - 32px)" }}
    >
      {/* Builder Actions Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          height: "64px",
          borderBottom: "1px solid rgba(100, 116, 139, 0.2)",
          mb: 2,
          px: 2,
          flexShrink: 0,
        }}
      >
        {onPublish && (
          <BuilderActions
            onSave={onSave}
            onPublish={onPublish}
            projectId={projectId}
            projectThumbnail={projectThumbnail}
            onThumbnailUpdate={onThumbnailUpdate}
            selectingPosition={selectingPosition}
            setSelectingPosition={setSelectingPosition}
            selectedPosition={selectedPosition}
            setSelectedPosition={setSelectedPosition}
            pendingModel={pendingModel}
            setPendingModel={setPendingModel}
          />
        )}
      </Box>

      {/* Panel Content - Wrapped in Box to enable flex layout */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <GenericPanel
          Container={({ children }) => <>{children}</>}
          config={config}
          renderSetting={(setting) => <SettingRenderer setting={setting} />}
          previewMode={previewMode}
        />
      </Box>
    </RightPanelContainer>
  );
};

export default RightPanel;
