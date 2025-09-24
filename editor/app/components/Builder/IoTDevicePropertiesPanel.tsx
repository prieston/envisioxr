"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Divider,
  TextField,
  Alert,
} from "@mui/material";
import useSceneStore from "../../hooks/useSceneStore";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloudIcon from "@mui/icons-material/Cloud";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import AirIcon from "@mui/icons-material/Air";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import DeviceHubIcon from "@mui/icons-material/DeviceHub";
import RefreshIcon from "@mui/icons-material/Refresh";

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
  const [expandedSections, setExpandedSections] = useState({
    connection: true,
    display: true,
    data: false,
  });

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const updateWeatherData = useSceneStore((state) => state.updateWeatherData);

  const iotProps = selectedObject?.iotProperties || {
    enabled: false,
    serviceType: "weather",
    apiEndpoint: "https://api.open-meteo.com/v1/forecast",
    updateInterval: 300000, // 5 minutes
    showInScene: true,
    displayFormat: "compact",
    autoRefresh: true,
  };

  const handleSectionToggle = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handlePropertyChange = (property: string, value: any) => {
    onPropertyChange(`iotProperties.${property}`, value);
  };

  const fetchWeatherData = useCallback(async () => {
    if (!geographicCoords) {
      setError("Geographic coordinates not available");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { latitude, longitude } = geographicCoords;

      // Try Open-Meteo API first
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,wind_direction_10m,relative_humidity_2m,surface_pressure,weather_code&timezone=auto`;

      const response = await fetch(url);

      // If Open-Meteo fails, use demo data
      let data;
      if (!response.ok) {
        // Use demo data for testing
        data = {
          current: {
            temperature_2m: 22.5,
            wind_speed_10m: 3.2,
            wind_direction_10m: 180,
            relative_humidity_2m: 65,
            surface_pressure: 1013.25,
            weather_code: 1,
          },
        };
      } else {
        data = await response.json();
      }

      const weatherCodes = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Fog",
        48: "Depositing rime fog",
        51: "Light drizzle",
        53: "Moderate drizzle",
        55: "Dense drizzle",
        61: "Slight rain",
        63: "Moderate rain",
        65: "Heavy rain",
        71: "Slight snow",
        73: "Moderate snow",
        75: "Heavy snow",
        80: "Slight rain showers",
        81: "Moderate rain showers",
        82: "Violent rain showers",
        95: "Thunderstorm",
        96: "Thunderstorm with slight hail",
        99: "Thunderstorm with heavy hail",
      };

      const weatherInfo: WeatherData = {
        temperature: data.current.temperature_2m,
        windSpeed: data.current.wind_speed_10m,
        windDirection: data.current.wind_direction_10m,
        humidity: data.current.relative_humidity_2m,
        pressure: data.current.surface_pressure,
        description:
          weatherCodes[
            data.current.weather_code as keyof typeof weatherCodes
          ] || "Unknown",
        lastUpdated: new Date(),
      };

      setWeatherData(weatherInfo);
      // Update the store with the new weather data
      if (selectedObject?.id) {
        updateWeatherData(selectedObject.id, weatherInfo);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch weather data"
      );
      console.error("Error fetching weather data:", err);
    } finally {
      setLoading(false);
    }
  }, [geographicCoords, selectedObject?.id, updateWeatherData]);

  // Initialize weather data from store
  useEffect(() => {
    if (selectedObject?.weatherData) {
      setWeatherData(selectedObject.weatherData);
    }
  }, [selectedObject?.weatherData]);

  // Auto-fetch weather data when coordinates change and IoT is enabled
  useEffect(() => {
    if (
      iotProps.enabled &&
      iotProps.autoRefresh &&
      geographicCoords &&
      !weatherData
    ) {
      fetchWeatherData();
    }
  }, [
    geographicCoords,
    iotProps.enabled,
    iotProps.autoRefresh,
    fetchWeatherData,
    weatherData,
  ]);

  // Set up auto-refresh interval
  useEffect(() => {
    if (
      iotProps.enabled &&
      iotProps.autoRefresh &&
      iotProps.updateInterval > 0
    ) {
      const interval = setInterval(() => {
        fetchWeatherData();
      }, iotProps.updateInterval);

      return () => clearInterval(interval);
    }
  }, [
    iotProps.enabled,
    iotProps.autoRefresh,
    iotProps.updateInterval,
    fetchWeatherData,
  ]);

  const getWindDirection = (degrees: number) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ display: "flex", alignItems: "center", gap: 1 }}
      >
        <DeviceHubIcon />
        IoT Device Configuration
      </Typography>

      {/* Connection Settings */}
      <Accordion
        expanded={expandedSections.connection}
        onChange={() => handleSectionToggle("connection")}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">Connection Settings</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={iotProps.enabled}
                    onChange={(e) =>
                      handlePropertyChange("enabled", e.target.checked)
                    }
                  />
                }
                label="Enable IoT Device"
              />
            </Grid>

            {iotProps.enabled && (
              <>
                <Grid item xs={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Service Type</InputLabel>
                    <Select
                      value={iotProps.serviceType}
                      onChange={(e) =>
                        handlePropertyChange("serviceType", e.target.value)
                      }
                      label="Service Type"
                    >
                      <MenuItem value="weather">Weather Service</MenuItem>
                      <MenuItem value="custom">Custom API</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="API Endpoint"
                    value={iotProps.apiEndpoint}
                    onChange={(e) =>
                      handlePropertyChange("apiEndpoint", e.target.value)
                    }
                    size="small"
                    disabled={iotProps.serviceType === "weather"}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Update Interval (ms)"
                    type="number"
                    value={iotProps.updateInterval}
                    onChange={(e) =>
                      handlePropertyChange(
                        "updateInterval",
                        Number(e.target.value)
                      )
                    }
                    size="small"
                  />
                </Grid>

                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={iotProps.autoRefresh}
                        onChange={(e) =>
                          handlePropertyChange("autoRefresh", e.target.checked)
                        }
                      />
                    }
                    label="Auto Refresh"
                  />
                </Grid>
              </>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Display Settings */}
      <Accordion
        expanded={expandedSections.display}
        onChange={() => handleSectionToggle("display")}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">Display Settings</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={iotProps.showInScene}
                    onChange={(e) =>
                      handlePropertyChange("showInScene", e.target.checked)
                    }
                  />
                }
                label="Show in 3D Scene"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Display Format</InputLabel>
                <Select
                  value={iotProps.displayFormat}
                  onChange={(e) =>
                    handlePropertyChange("displayFormat", e.target.value)
                  }
                  label="Display Format"
                >
                  <MenuItem value="compact">Compact</MenuItem>
                  <MenuItem value="detailed">Detailed</MenuItem>
                  <MenuItem value="minimal">Minimal</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Data Section */}
      {iotProps.enabled && (
        <Accordion
          expanded={expandedSections.data}
          onChange={() => handleSectionToggle("data")}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Live Data</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ mb: 2 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchWeatherData}
                disabled={loading || !geographicCoords}
                fullWidth
                sx={{ mb: 2 }}
              >
                {loading ? "Fetching..." : "Refresh Data"}
              </Button>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {!geographicCoords && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Geographic coordinates not available. Move the model to a
                  valid location.
                </Alert>
              )}

              {weatherData && (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <CloudIcon />
                    Current Weather Data
                  </Typography>

                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <ThermostatIcon fontSize="small" />
                        <Typography variant="body2">
                          {weatherData.temperature.toFixed(1)}°C
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={6}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <AirIcon fontSize="small" />
                        <Typography variant="body2">
                          {weatherData.windSpeed.toFixed(1)} m/s{" "}
                          {getWindDirection(weatherData.windDirection)}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="body2">
                        Humidity: {weatherData.humidity}%
                      </Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="body2">
                        Pressure: {weatherData.pressure} hPa
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <WbSunnyIcon fontSize="small" />
                        <Typography variant="body2">
                          {weatherData.description}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: "block" }}
                  >
                    Last updated: {weatherData.lastUpdated.toLocaleTimeString()}
                  </Typography>
                </Paper>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Status Indicators */}
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Chip
          label={iotProps.enabled ? "IoT Active" : "IoT Inactive"}
          color={iotProps.enabled ? "success" : "default"}
          size="small"
        />
        {weatherData && (
          <Chip label="Data Available" color="primary" size="small" />
        )}
        {iotProps.showInScene && (
          <Chip label="3D Display" color="secondary" size="small" />
        )}
      </Box>
    </Box>
  );
};

export default IoTDevicePropertiesPanel;
