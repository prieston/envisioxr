import { useSceneStore } from "@envisio/core";

interface WeatherData {
  temperature: number;
  windSpeed: number;
  windDirection: number;
  humidity: number;
  pressure: number;
  description: string;
  lastUpdated: Date;
}

interface IoTServiceConfig {
  enabled: boolean;
  serviceType: string;
  apiEndpoint: string;
  updateInterval: number;
  autoRefresh: boolean;
}

class IoTService {
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private isInitialized = false;
  private lastFetchTime: Map<string, number> = new Map();
  private readonly MIN_POLL_INTERVAL = 2000; // Minimum 2 seconds between requests

  constructor() {
    this.initialize();
  }

  public initialize() {
    if (this.isInitialized) return;

    // Listen for changes in the scene store
    this.setupStoreListener();
    this.isInitialized = true;
  }

  private setupStoreListener() {
    // We'll use a polling approach since Zustand doesn't have built-in change listeners
    // Check every 5 seconds for changes in objects with IoT properties
    setInterval(() => {
      this.checkForIoTUpdates();
    }, 5000);
  }

  private checkForIoTUpdates() {
    const state = useSceneStore.getState();
    const objects = state.objects || [];

    // Find all objects with IoT properties enabled
    const iotObjects = objects.filter(
      (obj) =>
        obj.iotProperties?.enabled &&
        obj.iotProperties?.autoRefresh &&
        obj.position
    );

    // Start/update intervals for each IoT object
    iotObjects.forEach((obj) => {
      const objectId = obj.id;
      const iotProps = obj.iotProperties!;

      // Enforce minimum poll interval of 2 seconds
      const pollInterval = Math.max(
        this.MIN_POLL_INTERVAL,
        iotProps.updateInterval
      );

      // Only recreate interval if it doesn't exist or the interval changed
      const existingInterval = this.intervals.get(objectId);
      if (!existingInterval) {
        // Start new interval
        const interval = setInterval(() => {
          this.fetchWeatherDataForObject(obj);
        }, pollInterval);

        this.intervals.set(objectId, interval);
      }
    });

    // Clean up intervals for objects that no longer have IoT enabled
    const iotObjectIds = new Set(iotObjects.map((obj) => obj.id));
    const intervalKeys = Array.from(this.intervals.keys());
    for (const objectId of intervalKeys) {
      if (!iotObjectIds.has(objectId)) {
        const interval = this.intervals.get(objectId);
        if (interval) {
          clearInterval(interval);
          this.intervals.delete(objectId);
          this.lastFetchTime.delete(objectId);
        }
      }
    }
  }

  private async fetchWeatherDataForObject(obj: any) {
    if (!obj.iotProperties?.enabled) return;

    // Rate limiting: Check if we fetched too recently
    const now = Date.now();
    const lastFetch = this.lastFetchTime.get(obj.id) || 0;
    const timeSinceLastFetch = now - lastFetch;

    if (timeSinceLastFetch < this.MIN_POLL_INTERVAL) {
      return;
    }

    let longitude = 0;
    let latitude = 0;

    try {
      if (!obj.position) return;
      const pos = obj.position;
      if (Array.isArray(pos) && pos.length >= 2) {
        longitude = pos[0];
        latitude = pos[1];
      } else {
        return;
      }
    } catch (e) {
      // Position might be a getter that throws or not be an array
      return;
    }

    const iotProps = obj.iotProperties;

    // Update last fetch time BEFORE making the request to prevent race conditions
    this.lastFetchTime.set(obj.id, now);

    try {
      if (iotProps.serviceType === "weather") {
        await this.fetchWeatherData(obj.id, longitude, latitude, iotProps);
      }
      // Add support for other service types here
    } catch (error) {
      // Error fetching IoT data
    }
  }

  private async fetchWeatherData(
    objectId: string,
    longitude: number,
    latitude: number,
    _config: IoTServiceConfig
  ) {
    try {
      // Force weather service to always use the correct Open-Meteo API endpoint
      // This prevents DNS resolution issues that might cause undefined URLs
      const weatherApiEndpoint = "https://api.open-meteo.com/v1/forecast";

      const url = `${weatherApiEndpoint}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,surface_pressure,weather_code`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status} for URL: ${url}`
        );
      }

      const data = await response.json();

      const weatherCodes: { [key: number]: string } = {
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
        77: "Snow grains",
        80: "Slight rain showers",
        81: "Moderate rain showers",
        82: "Violent rain showers",
        85: "Slight snow showers",
        86: "Heavy snow showers",
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
        description: weatherCodes[data.current.weather_code] || "Unknown",
        lastUpdated: new Date(),
      };

      // Update the store with the new weather data
      useSceneStore.getState().updateWeatherData(objectId, weatherInfo);
    } catch (error) {
      // Error fetching weather data
    }
  }

  // Method to manually trigger data fetch for a specific object
  public async fetchDataForObject(objectId: string) {
    const state = useSceneStore.getState();
    const obj = state.objects.find((o) => o.id === objectId);

    if (obj?.iotProperties?.enabled && obj.position) {
      await this.fetchWeatherDataForObject(obj);
    }
  }

  // Method to start IoT for a specific object
  public startIoTForObject(objectId: string) {
    const state = useSceneStore.getState();
    const obj = state.objects.find((o) => o.id === objectId);

    if (obj?.iotProperties?.enabled && obj.position) {
      this.fetchWeatherDataForObject(obj);
    }
  }

  // Method to stop IoT for a specific object
  public stopIoTForObject(objectId: string) {
    if (this.intervals.has(objectId)) {
      clearInterval(this.intervals.get(objectId)!);
      this.intervals.delete(objectId);
      this.lastFetchTime.delete(objectId);
    }
  }

  // Method to stop all IoT services
  public stopAll() {
    const intervalValues = Array.from(this.intervals.values());
    for (const interval of intervalValues) {
      clearInterval(interval);
    }
    this.intervals.clear();
    this.lastFetchTime.clear();
    this.isInitialized = false;
  }
}

// Create a singleton instance
const iotService = new IoTService();

export default iotService;
