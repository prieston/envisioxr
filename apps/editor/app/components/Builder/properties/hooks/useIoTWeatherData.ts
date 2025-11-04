import { useState, useEffect } from "react";
import { useSceneStore } from "@envisio/core";
import iotService from "../../../../services/IoTService";

export interface WeatherData {
  temperature: number;
  windSpeed: number;
  windDirection: number;
  humidity: number;
  pressure: number;
  description: string;
  lastUpdated: Date;
}

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
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get selected object from store to read weatherData
  const selectedObject = useSceneStore((state) => {
    if (!selectedObjectId) return null;
    return state.objects.find((o) => o.id === selectedObjectId);
  });

  // Sync weatherData from selectedObject
  useEffect(() => {
    if (selectedObject?.weatherData) {
      // Normalize lastUpdated to Date if it's a string
      const normalizedWeatherData: WeatherData = {
        ...selectedObject.weatherData,
        lastUpdated:
          selectedObject.weatherData.lastUpdated instanceof Date
            ? selectedObject.weatherData.lastUpdated
            : new Date(selectedObject.weatherData.lastUpdated),
      };
      setWeatherData(normalizedWeatherData);
    }
  }, [selectedObject?.weatherData]);

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
          setError(err instanceof Error ? err.message : "Failed to fetch weather data");
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

