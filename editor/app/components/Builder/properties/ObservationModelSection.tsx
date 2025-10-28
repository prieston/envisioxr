import React, { memo, useCallback } from "react";
import { Box, Switch, FormControlLabel } from "@mui/material";
import { SettingContainer, SettingLabel } from "../SettingRenderer.styles";
import SDKObservationPropertiesPanel from "./SDKObservationPropertiesPanel";
import { ModelObject } from "./types";
import { useSceneStore } from "@envisio/core";

interface ObservationModelSectionProps {
  object: ModelObject;
  onPropertyChange: (property: string, value: unknown) => void;
  onCalculateViewshed: () => void;
  isCalculating: boolean;
  updateObjectProperty: (id: string, property: string, value: unknown) => void;
}

/**
 * ObservationModelSection - Controls observation model settings
 * Optimized with React.memo and direct store subscriptions
 */
const ObservationModelSection: React.FC<ObservationModelSectionProps> = memo(
  ({
    object,
    onPropertyChange,
    onCalculateViewshed,
    isCalculating,
    updateObjectProperty,
  }) => {
    // Read isObservationModel directly from store to ensure it updates
    const isObservationModel = useSceneStore((state) => {
      const obj = state.objects.find((o) => o.id === object.id);
      return obj?.isObservationModel || false;
    });

    const handleToggle = useCallback(
      (checked: boolean) => {
        updateObjectProperty(object.id, "isObservationModel", checked);
      },
      [object.id, updateObjectProperty]
    );

    return (
      <SettingContainer>
        <SettingLabel>Observation Model</SettingLabel>

        {/* Enable Switch */}
        <Box
          sx={{
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            border: "1px solid rgba(226, 232, 240, 0.8)",
            mb: isObservationModel ? 2 : 0,
          }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={isObservationModel}
                onChange={(e) => {
                  const checked = e.target.checked;
                  handleToggle(checked);
                  if (checked && !object.observationProperties) {
                    updateObjectProperty(
                      object.id,
                      "observationProperties.sensorType",
                      "cone"
                    );
                  }
                }}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color: "#2563eb",
                  },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: "#2563eb",
                  },
                }}
              />
            }
            label="Enable Observation Model"
            sx={{
              margin: 0,
              padding: "8.5px 14px",
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              "& .MuiFormControlLabel-label": {
                fontSize: "0.75rem",
                fontWeight: 400,
                color: "rgba(51, 65, 85, 0.9)",
                flex: 1,
              },
            }}
            labelPlacement="start"
          />
        </Box>

        {/* Sensor Configuration - shown when enabled */}
        {isObservationModel && (
          <SDKObservationPropertiesPanel
            selectedObject={object}
            onPropertyChange={onPropertyChange}
            onCalculateViewshed={onCalculateViewshed}
            isCalculating={isCalculating}
          />
        )}
      </SettingContainer>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if the object ID changes or callback functions change
    return (
      prevProps.object.id === nextProps.object.id &&
      prevProps.onPropertyChange === nextProps.onPropertyChange &&
      prevProps.onCalculateViewshed === nextProps.onCalculateViewshed &&
      prevProps.isCalculating === nextProps.isCalculating &&
      prevProps.updateObjectProperty === nextProps.updateObjectProperty
    );
  }
);

ObservationModelSection.displayName = "ObservationModelSection";

export default ObservationModelSection;
