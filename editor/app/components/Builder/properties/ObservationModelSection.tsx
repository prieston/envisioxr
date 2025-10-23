import React from "react";
import { Box, Switch, FormControlLabel } from "@mui/material";
import { SettingContainer, SettingLabel } from "../SettingRenderer.styles";
import SDKObservationPropertiesPanel from "./SDKObservationPropertiesPanel";
import { ModelObject } from "./types";

interface ObservationModelSectionProps {
  object: ModelObject;
  onPropertyChange: (property: string, value: unknown) => void;
  onCalculateViewshed: () => void;
  isCalculating: boolean;
  updateObjectProperty: (id: string, property: string, value: unknown) => void;
}

const ObservationModelSection: React.FC<ObservationModelSectionProps> = ({
  object,
  onPropertyChange,
  onCalculateViewshed,
  isCalculating,
  updateObjectProperty,
}) => {
  return (
    <SettingContainer>
      <SettingLabel>Observation Model</SettingLabel>

      {/* Enable Switch */}
      <Box
        sx={{
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          border: "1px solid rgba(226, 232, 240, 0.8)",
          mb: object.isObservationModel ? 2 : 0,
        }}
      >
        <FormControlLabel
          control={
            <Switch
              checked={object.isObservationModel || false}
              onChange={(e) => {
                updateObjectProperty(
                  object.id,
                  "isObservationModel",
                  e.target.checked
                );
                if (e.target.checked && !object.observationProperties) {
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
      {object.isObservationModel && (
        <SDKObservationPropertiesPanel
          selectedObject={object}
          onPropertyChange={onPropertyChange}
          onCalculateViewshed={onCalculateViewshed}
          isCalculating={isCalculating}
        />
      )}
    </SettingContainer>
  );
};

export default ObservationModelSection;
