"use client";

import React, { useState, useEffect, memo } from "react";
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Alert,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import AirIcon from "@mui/icons-material/Air";
import {
  textFieldStyles,
  selectStyles,
  menuItemStyles,
  SettingContainer,
  SettingLabel,
} from "@envisio/ui";
import { useSceneStore } from "@envisio/core";

interface IoTDevicePropertiesPanelProps {
  selectedObject: any;
  onPropertyChange: (property: string, value: any) => void;
  geographicCoords: {
    latitude: number;
    longitude: number;
    altitude: number;
  } | null;
}

interface WeatherData {
  temperature: number;
  windSpeed: number;
  windDirection: number;
  humidity: number;
  pressure: number;
  description: string;
  lastUpdated: Date;
}

/**
 * IoTDevicePropertiesPanel - Controls IoT device settings and weather data
 * Optimized with React.memo and direct store subscriptions
 */
const IoTDevicePropertiesPanel: React.FC<IoTDevicePropertiesPanelProps> = memo(
  ({ selectedObject, onPropertyChange, geographicCoords }) => {
    // Read iotProperties directly from store to ensure switch updates
    const storeIotProps = useSceneStore((state) => {
      const obj = state.objects.find((o) => o.id === selectedObject?.id);
      return obj?.iotProperties;
    });

    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const iotProps = storeIotProps || {
      enabled: false,
      serviceType: "weather",
      apiEndpoint: "https://api.open-meteo.com/v1/forecast",
      updateInterval: 1000,
      showInScene: true,
      displayFormat: "compact",
      autoRefresh: true,
    };

    useEffect(() => {
      if (selectedObject?.weatherData)
        setWeatherData(selectedObject.weatherData);
    }, [selectedObject?.weatherData]);

    useEffect(() => {
      if (
        iotProps.enabled &&
        iotProps.autoRefresh &&
        geographicCoords &&
        !weatherData &&
        selectedObject?.id
      ) {
        import("../../../services/IoTService").then(
          ({ default: iotService }) => {
            iotService.fetchDataForObject(selectedObject.id);
          }
        );
      }
    }, [
      geographicCoords,
      iotProps.enabled,
      iotProps.autoRefresh,
      weatherData,
      selectedObject?.id,
    ]);

    // Early return after all hooks are called
    if (!selectedObject) {
      return null;
    }

    const handlePropertyChange = (property: string, value: any) => {
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

    const getWindDirection = (degrees: number): string => {
      const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
      const index = Math.round(degrees / 45) % 8;
      return directions[index];
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
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Service Type */}
            <Box>
              <Typography
                sx={(theme) => ({
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color:
                    theme.palette.mode === "dark"
                      ? theme.palette.text.secondary
                      : "rgba(100, 116, 139, 0.8)",
                  mb: theme.spacing(1),
                })}
              >
                Service Type
              </Typography>
              <Select
                value={iotProps.serviceType}
                onChange={(e) =>
                  handlePropertyChange("serviceType", e.target.value)
                }
                fullWidth
                size="small"
                sx={selectStyles}
              >
                <MenuItem value="weather" sx={menuItemStyles}>
                  Weather Service
                </MenuItem>
                <MenuItem value="custom" sx={menuItemStyles}>
                  Custom API
                </MenuItem>
              </Select>
            </Box>

            {/* API Endpoint */}
            <Box>
              <Typography
                sx={(theme) => ({
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color:
                    theme.palette.mode === "dark"
                      ? theme.palette.text.secondary
                      : "rgba(100, 116, 139, 0.8)",
                  mb: theme.spacing(1),
                })}
              >
                API Endpoint
              </Typography>
              <TextField
                fullWidth
                value={iotProps.apiEndpoint}
                onChange={(e) =>
                  handlePropertyChange("apiEndpoint", e.target.value)
                }
                size="small"
                disabled={iotProps.serviceType === "weather"}
                sx={textFieldStyles}
              />
            </Box>

            {/* Update Interval */}
            <Box>
              <Typography
                sx={(theme) => ({
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color:
                    theme.palette.mode === "dark"
                      ? theme.palette.text.secondary
                      : "rgba(100, 116, 139, 0.8)",
                  mb: theme.spacing(1),
                })}
              >
                Update Interval (ms)
              </Typography>
              <TextField
                id={`iot-update-interval-${selectedObject.id}`}
                name="iot-update-interval"
                fullWidth
                type="number"
                value={iotProps.updateInterval}
                onChange={(e) =>
                  handlePropertyChange("updateInterval", Number(e.target.value))
                }
                size="small"
                sx={textFieldStyles}
              />
            </Box>

            {/* Auto Refresh Switch */}
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
              })}
            >
              <FormControlLabel
                control={
                  <Switch
                    id={`iot-auto-refresh-${selectedObject.id}`}
                    name="iot-auto-refresh"
                    checked={iotProps.autoRefresh}
                    onChange={(e) =>
                      handlePropertyChange("autoRefresh", e.target.checked)
                    }
                    sx={(theme) => ({
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: theme.palette.primary.main,
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                        {
                          backgroundColor: theme.palette.primary.main,
                        },
                    })}
                  />
                }
                label="Auto Refresh"
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

            {/* Display Settings Subsection */}
            <Box sx={{ mt: 2 }}>
              <Typography
                sx={{
                  fontSize: "0.688rem",
                  fontWeight: 600,
                  color: "rgba(51, 65, 85, 0.85)",
                  mb: 1.5,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Display Settings
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Show in Scene Switch */}
                <Box
                  sx={(theme) => ({
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? "#14171A"
                        : "rgba(255, 255, 255, 0.92)",
                    borderRadius: "4px",
                    border:
                      theme.palette.mode === "dark"
                        ? "1px solid rgba(255, 255, 255, 0.05)"
                        : "1px solid rgba(226, 232, 240, 0.8)",
                  })}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        id={`iot-show-in-scene-${selectedObject.id}`}
                        name="iot-show-in-scene"
                        checked={iotProps.showInScene}
                        onChange={(e) =>
                          handlePropertyChange("showInScene", e.target.checked)
                        }
                        sx={{
                          "& .MuiSwitch-switchBase.Mui-checked": {
                            color: "var(--color-primary, #6B9CD8)",
                          },
                          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                            {
                              backgroundColor:
                                "var(--color-primary-600, #4B6FAF)",
                            },
                        }}
                      />
                    }
                    label="Show in 3D Scene"
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

                {/* Display Format */}
                <Box>
                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      color: "rgba(100, 116, 139, 0.8)",
                      mb: 0.75,
                    }}
                  >
                    Display Format
                  </Typography>
                  <Select
                    value={iotProps.displayFormat}
                    onChange={(e) =>
                      handlePropertyChange("displayFormat", e.target.value)
                    }
                    fullWidth
                    size="small"
                    sx={selectStyles}
                  >
                    <MenuItem value="compact" sx={menuItemStyles}>
                      Compact
                    </MenuItem>
                    <MenuItem value="detailed" sx={menuItemStyles}>
                      Detailed
                    </MenuItem>
                    <MenuItem value="minimal" sx={menuItemStyles}>
                      Minimal
                    </MenuItem>
                  </Select>
                </Box>
              </Box>
            </Box>

            {/* Live Data Subsection */}
            <Box sx={{ mt: 2 }}>
              <Typography
                sx={{
                  fontSize: "0.688rem",
                  fontWeight: 600,
                  color: "rgba(51, 65, 85, 0.85)",
                  mb: 1.5,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Live Data
              </Typography>

              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={async () => {
                  if (selectedObject?.id) {
                    setLoading(true);
                    setError(null);
                    try {
                      const { default: iotService } = await import(
                        "../../../services/IoTService"
                      );
                      await iotService.fetchDataForObject(selectedObject.id);
                    } catch (err) {
                      setError(
                        err instanceof Error
                          ? err.message
                          : "Failed to fetch data"
                      );
                    } finally {
                      setLoading(false);
                    }
                  }
                }}
                disabled={loading || !geographicCoords}
                fullWidth
                sx={{
                  borderRadius: "4px",
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: "0.75rem",
                  borderColor: "rgba(95, 136, 199, 0.3)",
                  color: "var(--color-primary, #6B9CD8)",
                  padding: "6px 16px",
                  mb: 2,
                  "&:hover": {
                    borderColor: "var(--color-primary, #6B9CD8)",
                    backgroundColor: "rgba(95, 136, 199, 0.08)",
                  },
                }}
              >
                {loading ? "Fetching..." : "Refresh Data"}
              </Button>

              {error && (
                <Alert severity="error" sx={{ mb: 2, fontSize: "0.75rem" }}>
                  {error}
                </Alert>
              )}

              {!geographicCoords && (
                <Alert severity="warning" sx={{ mb: 2, fontSize: "0.75rem" }}>
                  Geographic coordinates not available. Move the model to a
                  valid location.
                </Alert>
              )}

              {weatherData && (
                <Box
                  sx={(theme) => ({
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? "#14171A"
                        : "rgba(255, 255, 255, 0.92)",
                    borderRadius: "4px",
                    border:
                      theme.palette.mode === "dark"
                        ? "1px solid rgba(255, 255, 255, 0.05)"
                        : "1px solid rgba(226, 232, 240, 0.8)",
                    padding: "14px",
                  })}
                >
                  <Typography
                    sx={(theme) => ({
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color:
                        theme.palette.mode === "dark"
                          ? theme.palette.text.primary
                          : "rgba(51, 65, 85, 0.9)",
                      mb: 2,
                    })}
                  >
                    Current Weather Data
                  </Typography>

                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                  >
                    {/* Temperature */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <ThermostatIcon
                        sx={{
                          fontSize: "1rem",
                          color: "rgba(100, 116, 139, 0.7)",
                        }}
                      />
                      <Typography
                        sx={{
                          fontSize: "0.75rem",
                          color: "rgba(51, 65, 85, 0.9)",
                        }}
                      >
                        Temperature: {weatherData.temperature.toFixed(1)}°C
                      </Typography>
                    </Box>

                    {/* Wind */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AirIcon
                        sx={{
                          fontSize: "1rem",
                          color: "rgba(100, 116, 139, 0.7)",
                        }}
                      />
                      <Typography
                        sx={{
                          fontSize: "0.75rem",
                          color: "rgba(51, 65, 85, 0.9)",
                        }}
                      >
                        Wind: {weatherData.windSpeed.toFixed(1)} m/s{" "}
                        {getWindDirection(weatherData.windDirection)}
                      </Typography>
                    </Box>

                    {/* Humidity */}
                    <Typography
                      sx={{
                        fontSize: "0.75rem",
                        color: "rgba(51, 65, 85, 0.9)",
                      }}
                    >
                      Humidity: {weatherData.humidity}%
                    </Typography>

                    {/* Pressure */}
                    <Typography
                      sx={{
                        fontSize: "0.75rem",
                        color: "rgba(51, 65, 85, 0.9)",
                      }}
                    >
                      Pressure: {weatherData.pressure} hPa
                    </Typography>

                    {/* Description */}
                    <Typography
                      sx={{
                        fontSize: "0.75rem",
                        color: "rgba(51, 65, 85, 0.9)",
                      }}
                    >
                      {weatherData.description}
                    </Typography>

                    {/* Last Updated */}
                    <Typography
                      sx={{
                        fontSize: "0.688rem",
                        color: "rgba(100, 116, 139, 0.7)",
                        mt: 0.5,
                      }}
                    >
                      Last updated:{" "}
                      {(() => {
                        const date = weatherData.lastUpdated;
                        if (date instanceof Date)
                          return date.toLocaleTimeString();
                        else if (typeof date === "string")
                          return new Date(date).toLocaleTimeString();
                        return "Unknown";
                      })()}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </SettingContainer>
    );
  }
);

IoTDevicePropertiesPanel.displayName = "IoTDevicePropertiesPanel";

export default IoTDevicePropertiesPanel;
