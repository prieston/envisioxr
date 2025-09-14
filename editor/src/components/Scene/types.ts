export interface Model {
  id: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  name?: string;
  url?: string;
  type?: string;
  apiKey?: string;
  assetId?: string;
  component?: string;
  isObservationModel?: boolean;
  observationProperties?: {
    // Sensor Configuration
    sensorType: "cone" | "rectangle" | "dome" | "custom";
    fov: number; // Field of view in degrees (10-360)
    fovH?: number; // Horizontal FOV for rectangle sensors
    fovV?: number; // Vertical FOV for rectangle sensors
    maxPolar?: number; // Max polar angle for dome sensors (degrees)
    visibilityRadius: number; // Radius in meters

    // Visualization Options
    showSensorGeometry: boolean; // Show the sensor cone/rectangle/dome
    showViewshed: boolean; // Show calculated viewshed polygon
    sensorColor?: string; // Color for sensor geometry
    viewshedColor?: string; // Color for viewshed polygon

    // Analysis Options
    analysisQuality: "low" | "medium" | "high";
    raysAzimuth?: number; // Number of azimuth samples
    raysElevation?: number; // Number of elevation slices
    clearance?: number; // Clearance above terrain (meters)
    stepCount?: number; // Samples per ray

    // Transform Editor
    enableTransformEditor: boolean; // Enable gizmo for sensor manipulation
  };
  [key: string]: any; // For any additional properties
}

export interface CesiumIonAsset {
  id: string;
  name: string;
  apiKey: string;
  assetId: string;
  enabled: boolean;
}

export interface ObservationPoint {
  id: number;
  title: string;
  description: string;
  position: [number, number, number] | null;
  target: [number, number, number] | null;
}

export interface SceneProps {
  initialSceneData?: {
    objects?: Model[];
    observationPoints?: ObservationPoint[];
    selectedAssetId?: string;
    selectedLocation?: {
      latitude: number;
      longitude: number;
    } | null;
    cesiumIonAssets?: CesiumIonAsset[];
  };
  renderObservationPoints?: boolean;
  onSceneDataChange?: (data: {
    objects: Model[];
    observationPoints: ObservationPoint[];
    selectedAssetId: string;
    selectedLocation: {
      latitude: number;
      longitude: number;
    } | null;
    cesiumIonAssets: CesiumIonAsset[];
  }) => void;
  enableXR?: boolean;
  isPublishMode?: boolean;
}

export interface SceneObjectsProps {
  objects: Model[];
  previewMode: boolean;
  enableXR: boolean;
  isPublishMode?: boolean;
}

export interface SceneObservationPointsProps {
  points: ObservationPoint[];
  previewMode: boolean;
  enableXR: boolean;
  renderObservationPoints: boolean;
}

export interface SceneTransformControlsProps {
  selectedObject: Model | null;
  transformControlsRef: React.RefObject<any>;
}
