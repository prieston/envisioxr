"use client";

import React, { useMemo } from "react";
import { Box } from "@mui/material";
import { useSceneStore, useWorldStore } from "@envisio/core";
import { getRightPanelConfig } from "@envisio/config/factory";
import { RightPanelContainer, GenericPanel } from "@envisio/ui";
import SettingRenderer from "../../SettingRenderer";
import BuilderActions from "@/app/components/AppBar/BuilderActions";

interface RightPanelProps {
  onSave?: () => Promise<void>;
  onPublish?: () => void;
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
  const previewMode = useSceneStore((state) => state.previewMode);
  const { engine } = useWorldStore();

  const selectedObservation = useSceneStore(
    (state) => state.selectedObservation
  );
  const viewMode = useSceneStore((state) => state.viewMode);
  const controlSettings = useSceneStore((state) => state.controlSettings);
  const updateObjectProperty = useSceneStore(
    (state) => state.updateObjectProperty
  );
  const updateObservationPoint = useSceneStore(
    (state) => state.updateObservationPoint
  );
  const deleteObservationPoint = useSceneStore(
    (state) => state.deleteObservationPoint
  );
  const setCapturingPOV = useSceneStore((state) => state.setCapturingPOV);
  const updateControlSettings = useSceneStore(
    (state) => state.updateControlSettings
  );

  // For selectedObject, exclude weatherData to prevent re-renders when IoT updates
  const selectedObject = useSceneStore((state) => {
    if (!state.selectedObject) return null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { weatherData, ...rest } = state.selectedObject;
    return rest;
  });

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
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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
