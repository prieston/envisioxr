"use client";

import React, { useState, useEffect } from "react";
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
  SettingContainer,
  SettingLabel,
  SettingDescription,
} from "../SettingRenderer.styles";
import { textFieldStyles, selectStyles, menuItemStyles } from "@envisio/ui";

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

const IoTDevicePropertiesPanel: React.FC<IoTDevicePropertiesPanelProps> = ({
  selectedObject,
  onPropertyChange,
  geographicCoords,
}) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const iotProps = selectedObject?.iotProperties || {
    enabled: false,
    serviceType: "weather",
    apiEndpoint: "https://api.open-meteo.com/v1/forecast",
    updateInterval: 1000,
    showInScene: true,
    displayFormat: "compact",
    autoRefresh: true,
  };

  const handlePropertyChange = (property: string, value: any) =>
    onPropertyChange(`iotProperties.${property}`, value);

  useEffect(() => {
    if (selectedObject?.weatherData) setWeatherData(selectedObject.weatherData);
  }, [selectedObject?.weatherData]);

  useEffect(() => {
    if (
      iotProps.enabled &&
      iotProps.autoRefresh &&
      geographicCoords &&
      !weatherData &&
      selectedObject?.id
    ) {
      import("../../../services/IoTService").then(({ default: iotService }) => {
        iotService.fetchDataForObject(selectedObject.id);
      });
    }
  }, [
    geographicCoords,
    iotProps.enabled,
    iotProps.autoRefresh,
    weatherData,
    selectedObject?.id,
  ]);

  const getWindDirection = (degrees: number) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  return (
    <Box>
      {/* IoT Connection Settings Section */}
      <SettingContainer>
        <SettingLabel>IoT Connection Settings</SettingLabel>

        {/* Enable IoT Device Switch */}
        <Box
          sx={{
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            border: "1px solid rgba(226, 232, 240, 0.8)",
            mb: 2,
          }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={iotProps.enabled}
                onChange={(e) =>
                  handlePropertyChange("enabled", e.target.checked)
                }
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
            label="Enable IoT Device"
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

        {iotProps.enabled && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Service Type */}
            <Box>
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  color: "rgba(100, 116, 139, 0.8)",
                  mb: 0.75,
                }}
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
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  color: "rgba(100, 116, 139, 0.8)",
                  mb: 0.75,
                }}
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
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  color: "rgba(100, 116, 139, 0.8)",
                  mb: 0.75,
                }}
              >
                Update Interval (ms)
              </Typography>
              <TextField
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
              sx={{
                backgroundColor: "#ffffff",
                borderRadius: "8px",
                border: "1px solid rgba(226, 232, 240, 0.8)",
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={iotProps.autoRefresh}
                    onChange={(e) =>
                      handlePropertyChange("autoRefresh", e.target.checked)
                    }
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: "#2563eb",
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                        {
                          backgroundColor: "#2563eb",
                        },
                    }}
                  />
                }
                label="Auto Refresh"
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
                  sx={{
                    backgroundColor: "#ffffff",
                    borderRadius: "8px",
                    border: "1px solid rgba(226, 232, 240, 0.8)",
                  }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={iotProps.showInScene}
                        onChange={(e) =>
                          handlePropertyChange("showInScene", e.target.checked)
                        }
                        sx={{
                          "& .MuiSwitch-switchBase.Mui-checked": {
                            color: "#2563eb",
                          },
                          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                            {
                              backgroundColor: "#2563eb",
                            },
                        }}
                      />
                    }
                    label="Show in 3D Scene"
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
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: "0.75rem",
                  borderColor: "rgba(37, 99, 235, 0.3)",
                  color: "#2563eb",
                  padding: "6px 16px",
                  mb: 2,
                  "&:hover": {
                    borderColor: "#2563eb",
                    backgroundColor: "rgba(37, 99, 235, 0.08)",
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
                  sx={{
                    backgroundColor: "#ffffff",
                    borderRadius: "8px",
                    border: "1px solid rgba(226, 232, 240, 0.8)",
                    padding: "14px",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "rgba(51, 65, 85, 0.9)",
                      mb: 2,
                    }}
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
    </Box>
  );
};

export default IoTDevicePropertiesPanel;
