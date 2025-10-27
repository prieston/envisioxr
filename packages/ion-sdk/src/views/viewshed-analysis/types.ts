export type AxisDirection = "X+" | "X-" | "Y+" | "Y-" | "Z+" | "Z-";
export type ManualDirection = "x" | "y" | "z" | "negX" | "negY" | "negZ";
export type SensorType = "cone" | "rectangle" | "dome" | "custom";
export type AnalysisQuality = "low" | "medium" | "high";

export interface ObservationProperties {
  sensorType: SensorType;
  fov: number;
  fovH?: number;
  fovV?: number;
  maxPolar?: number;
  visibilityRadius: number;
  showSensorGeometry: boolean;
  showViewshed: boolean;
  sensorColor?: string;
  viewshedColor?: string;
  analysisQuality: AnalysisQuality;
  include3DModels?: boolean;
  alignWithModelFront?: boolean;
  manualFrontDirection?: ManualDirection;
  modelFrontAxis?: AxisDirection;
  sensorForwardAxis?: AxisDirection;
  tiltDeg?: number;
}

export interface ViewshedAnalysisProps {
  position: [number, number, number];
  rotation: [number, number, number];
  observationProperties: ObservationProperties;
  objectId: string;
  cesiumViewer?: any;
}

export interface SensorRefs {
  sensorRef: React.MutableRefObject<any>;
  sensorCompositeRef: React.MutableRefObject<any>;
  viewshedRef: React.MutableRefObject<any>;
}

export interface TransformConfig {
  position: [number, number, number];
  rotation: [number, number, number];
  sensorForwardAxis: AxisDirection;
  modelFrontAxis: AxisDirection;
  tiltDeg: number;
}
