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
  // Use custom equality to prevent re-renders on nested property changes
  const selectedObject = useSceneStore(
    (state) => {
      if (!state.selectedObject) return null;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { weatherData, ...rest } = state.selectedObject;
      return rest;
    },
    (oldVal, newVal) => {
      // Custom equality: only trigger re-render if object identity changes
      // This prevents re-renders when nested properties (like observationProperties.fov) change
      if (oldVal === null && newVal === null) return true;
      if (oldVal === null || newVal === null) return false;
      // Only re-render if the object ID changes (i.e., different object selected)
      return oldVal.id === newVal.id;
    }
  );

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
      { engine }
    );
    // Only depend on object ID, not the full object to prevent unnecessary re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    engine,
    selectedObjectId,
    selectedObservation,
    viewMode,
    controlSettings,
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

      {/* Panel Content - Direct pass through, no wrapper */}
      <GenericPanel
        Container={({ children }) => <>{children}</>}
        config={config}
        renderSetting={(setting) => <SettingRenderer setting={setting} />}
        previewMode={previewMode}
      />
    </RightPanelContainer>
  );
};

export default RightPanel;
