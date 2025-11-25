"use client";

import React from "react";
import { Box, Typography, Button, Alert } from "@mui/material";
import { RefreshIcon, ThermostatIcon, AirIcon } from "@klorad/ui";
import type { WeatherData } from "./hooks/useIoTWeatherData";
import { iotService } from "@klorad/core";

interface IoTWeatherDisplayProps {
  selectedObjectId: string | undefined;
  weatherData: WeatherData | null;
  loading: boolean;
  error: string | null;
  geographicCoords: {
    latitude: number;
    longitude: number;
    altitude: number;
  } | null;
}

/**
 * IoTWeatherDisplay - Handles weather data display and refresh UI
 * Extracted from IoTDevicePropertiesPanel for better maintainability
 */
export const IoTWeatherDisplay: React.FC<IoTWeatherDisplayProps> = ({
  selectedObjectId,
  weatherData,
  loading,
  error,
  geographicCoords,
}) => {
  const getWindDirection = (degrees: number): string => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  const handleRefresh = async () => {
    if (selectedObjectId) {
      try {
        await iotService.fetchDataForObject(selectedObjectId);
      } catch (err) {
        // Error handling is done by the hook
      }
    }
  };

  return (
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
        onClick={handleRefresh}
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
          Geographic coordinates not available. Move the model to a valid
          location.
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

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
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
                if (date instanceof Date) return date.toLocaleTimeString();
                else if (typeof date === "string")
                  return new Date(date).toLocaleTimeString();
                return "Unknown";
              })()}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

