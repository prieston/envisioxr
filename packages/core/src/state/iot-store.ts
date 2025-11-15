import { create } from "zustand";

export interface WeatherData {
  temperature: number;
  windSpeed: number;
  windDirection: number;
  humidity: number;
  pressure: number;
  description: string;
  lastUpdated: Date;
}

interface IoTDataState {
  // Object map of objectId -> weatherData (better for Zustand reactivity than Map)
  weatherData: Record<string, WeatherData>;

  // Actions
  updateWeatherData: (objectId: string, weatherData: WeatherData) => void;
  getWeatherData: (objectId: string) => WeatherData | undefined;
  clearWeatherData: (objectId: string) => void;
  clearAllWeatherData: () => void;
}

/**
 * Separate store for IoT data (weather, sensors, etc.)
 * This prevents IoT updates from causing re-renders of scene objects
 * Uses Record instead of Map for better Zustand reactivity
 */
export const useIoTStore = create<IoTDataState>((set, get) => ({
  weatherData: {},

  updateWeatherData: (objectId: string, weatherData: WeatherData) => {
    set((state) => {
      // Create new object to ensure Zustand detects the change
      const updated = {
        ...state.weatherData,
        [objectId]: weatherData,
      };
      return { weatherData: updated };
    });
  },

  getWeatherData: (objectId: string) => {
    return get().weatherData[objectId];
  },

  clearWeatherData: (objectId: string) => {
    set((state) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [objectId]: _, ...rest } = state.weatherData;
      return { weatherData: rest };
    });
  },

  clearAllWeatherData: () => {
    set({ weatherData: {} });
  },
}));

