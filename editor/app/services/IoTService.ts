import useSceneStore from "../hooks/useSceneStore";

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

      // Clear existing interval if it exists
      if (this.intervals.has(objectId)) {
        clearInterval(this.intervals.get(objectId)!);
      }

      // Start new interval
      const interval = setInterval(() => {
        this.fetchWeatherDataForObject(obj);
      }, iotProps.updateInterval);

      this.intervals.set(objectId, interval);
    });

    // Clean up intervals for objects that no longer have IoT enabled
    const iotObjectIds = new Set(iotObjects.map((obj) => obj.id));
    for (const [objectId, interval] of this.intervals.entries()) {
      if (!iotObjectIds.has(objectId)) {
        clearInterval(interval);
        this.intervals.delete(objectId);
      }
    }
  }

  private async fetchWeatherDataForObject(obj: any) {
    if (!obj.iotProperties?.enabled || !obj.position) return;

    const [longitude, latitude] = obj.position;
    const iotProps = obj.iotProperties;

    try {
      if (iotProps.serviceType === "weather") {
        await this.fetchWeatherData(obj.id, longitude, latitude, iotProps);
      }
      // Add support for other service types here
    } catch (error) {
      console.error(`Error fetching IoT data for object ${obj.id}:`, error);
    }
  }

  private async fetchWeatherData(
    objectId: string,
    longitude: number,
    latitude: number,
    config: IoTServiceConfig
  ) {
    try {
      const response = await fetch(
        `${config.apiEndpoint}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,surface_pressure,weather_code`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
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
      console.error("Error fetching weather data:", error);
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
    }
  }

  // Method to stop all IoT services
  public stopAll() {
    for (const interval of this.intervals.values()) {
      clearInterval(interval);
    }
    this.intervals.clear();
  }
}

// Create a singleton instance
const iotService = new IoTService();

export default iotService;
