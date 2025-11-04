"use client";

import React, { memo } from "react";
import { Box, Switch, FormControlLabel } from "@mui/material";
import {
  SettingContainer,
  SettingLabel,
} from "@envisio/ui";
import { useSceneStore } from "@envisio/core";
import { useIoTWeatherData } from "./hooks/useIoTWeatherData";
import { IoTDeviceSettings } from "./IoTDeviceSettings";
import { IoTWeatherDisplay } from "./IoTWeatherDisplay";
import { ModelObject } from "./types";

interface IoTDevicePropertiesPanelProps {
  selectedObject: ModelObject | null;
  onPropertyChange: (property: string, value: unknown) => void;
  geographicCoords: {
    latitude: number;
    longitude: number;
    altitude: number;
  } | null;
}

/**
 * IoTDevicePropertiesPanel - Controls IoT device settings and weather data
 * Optimized with React.memo and direct store subscriptions
 */
const IoTDevicePropertiesPanel: React.FC<IoTDevicePropertiesPanelProps> = memo(
  ({ selectedObject, onPropertyChange, geographicCoords }) => {
    // Read iotProperties directly from store to ensure switch updates
    const storeIotProps = useSceneStore((state) => {
      if (!selectedObject?.id) return undefined;
      const obj = state.objects.find((o) => o.id === selectedObject.id);
      return obj?.iotProperties;
    });

    const iotProps = storeIotProps || {
      enabled: false,
      serviceType: "weather",
      apiEndpoint: "https://api.open-meteo.com/v1/forecast",
      updateInterval: 1000,
      showInScene: true,
      displayFormat: "compact",
      autoRefresh: true,
    };

    // Use custom hook for weather data fetching
    const { weatherData, loading, error } = useIoTWeatherData(
      selectedObject?.id,
      geographicCoords,
      iotProps
    );

    // Early return after all hooks are called
    if (!selectedObject) {
      return null;
    }

    const handlePropertyChange = (property: string, value: unknown) => {
      // If enabling IoT for the first time, initialize all properties
      if (
        property === "enabled" &&
        value === true &&
        !selectedObject.iotProperties
      ) {
        onPropertyChange("iotProperties", {
          enabled: true,
          serviceType: "weather",
          apiEndpoint: "https://api.open-meteo.com/v1/forecast",
          updateInterval: 2000,
          showInScene: true,
          displayFormat: "compact",
          autoRefresh: true,
        });
      } else {
        onPropertyChange(`iotProperties.${property}`, value);
      }
    };

    return (
      <SettingContainer>
        <SettingLabel>IoT Connection Settings</SettingLabel>

        {/* Enable IoT Device Switch */}
        <Box
          sx={(theme) => ({
            backgroundColor:
              theme.palette.mode === "dark"
                ? theme.palette.background.paper
                : theme.palette.common.white,
            borderRadius: "4px",
            border:
              theme.palette.mode === "dark"
                ? "1px solid rgba(255, 255, 255, 0.08)"
                : "1px solid rgba(255, 255, 255, 0.08)",
            mb: theme.spacing(2),
          })}
        >
          <FormControlLabel
            control={
              <Switch
                id={`iot-enabled-${selectedObject.id}`}
                name="iot-enabled"
                checked={iotProps.enabled}
                onChange={(e) =>
                  handlePropertyChange("enabled", e.target.checked)
                }
                sx={(theme) => ({
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color: theme.palette.primary.main,
                  },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: theme.palette.primary.main,
                  },
                })}
              />
            }
            label="Enable IoT Device"
            sx={(theme) => ({
              margin: 0,
              padding: "8.5px 14px",
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              "& .MuiFormControlLabel-label": {
                fontSize: "0.75rem",
                fontWeight: 400,
                color: theme.palette.text.secondary,
                flex: 1,
              },
            })}
            labelPlacement="start"
          />
        </Box>

        {iotProps.enabled && (
          <>
            <IoTDeviceSettings
              selectedObjectId={selectedObject.id}
              iotProps={iotProps}
              onPropertyChange={handlePropertyChange}
            />
            <IoTWeatherDisplay
              selectedObjectId={selectedObject.id}
              weatherData={weatherData}
              loading={loading}
              error={error}
              geographicCoords={geographicCoords}
            />
          </>
        )}
      </SettingContainer>
    );
  }
);

IoTDevicePropertiesPanel.displayName = "IoTDevicePropertiesPanel";

export default IoTDevicePropertiesPanel;
