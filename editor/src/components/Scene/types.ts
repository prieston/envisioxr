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
    fov: number; // Field of view in degrees (10-360)
    showVisibleArea: boolean;
    visibilityRadius: number; // Radius in meters
    iotProvider?: string; // Selected IoT provider
    iotData?: {
      speed: number;
      volume: number;
      occupancy: number;
    };
  };
  [key: string]: any; // For any additional properties
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
