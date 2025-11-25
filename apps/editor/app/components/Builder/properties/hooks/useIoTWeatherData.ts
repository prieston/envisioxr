import { useState, useEffect, useMemo } from "react";
import { useIoTStore } from "@klorad/core";
import { iotService } from "@klorad/core";

// Re-export WeatherData for backward compatibility
export type { WeatherData } from "@klorad/core";

interface IoTProperties {
  enabled: boolean;
  serviceType: string;
  apiEndpoint: string;
  updateInterval: number;
  showInScene: boolean;
  displayFormat: "compact" | "detailed" | "minimal";
  autoRefresh: boolean;
}

interface GeographicCoords {
  latitude: number;
  longitude: number;
  altitude: number;
}

/**
 * Custom hook for managing IoT weather data fetching
 * Extracts weather fetching logic from IoTDevicePropertiesPanel
 */
export function useIoTWeatherData(
  selectedObjectId: string | undefined,
  geographicCoords: GeographicCoords | null,
  iotProps: IoTProperties
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to IoT store for weather data (separate from scene objects)
  // Subscribe to the entire weatherData object - Zustand tracks object reference changes
  // Then extract the specific objectId's data using useMemo
  // Don't use shallow here - we want to detect when the object reference changes
  const weatherDataMap = useIoTStore((state) => state.weatherData);
  const weatherData = useMemo(
    () => (selectedObjectId ? weatherDataMap[selectedObjectId] : null),
    [weatherDataMap, selectedObjectId]
  );

  // Fetch weather data when conditions are met
  useEffect(() => {
    if (
      iotProps.enabled &&
      iotProps.autoRefresh &&
      geographicCoords &&
      !weatherData &&
      selectedObjectId
    ) {
      setLoading(true);
      setError(null);

      iotService
        .fetchDataForObject(selectedObjectId)
        .then(() => {
          setLoading(false);
        })
        .catch((err) => {
          setError(
            err instanceof Error ? err.message : "Failed to fetch weather data"
          );
          setLoading(false);
        });
    }
  }, [
    geographicCoords,
    iotProps.enabled,
    iotProps.autoRefresh,
    weatherData,
    selectedObjectId,
  ]);

  return {
    weatherData,
    loading,
    error,
  };
}
