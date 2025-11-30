export interface CesiumMinimalViewerProps {
  containerRef: React.RefObject<HTMLDivElement>;
  cesiumAssetId?: string;
  cesiumApiKey?: string;
  assetType?: string;
  onViewerReady?: (viewer: any) => void;
  onError?: (error: Error) => void;
  onLocationNotSet?: () => void;
  onTilesetReady?: (tileset: any) => void;
  initialTransform?: number[];
  metadata?: Record<string, unknown> | null;
  enableLocationEditing?: boolean;
  enableClickToPosition?: boolean;
  enableAtmosphere?: boolean; // Show Earth's atmosphere
  onLocationClick?: (
    longitude: number,
    latitude: number,
    height: number,
    matrix: number[]
  ) => void;
}

export interface CesiumViewer {
  scene: any;
  camera: any;
  isDestroyed: () => boolean;
  destroy: () => void;
  imageryLayers: any;
  terrainProvider: any;
  zoomTo: (target: any, options?: any) => void;
}

export interface CesiumModule {
  Viewer: any;
  Ion: any;
  Cartesian3: any;
  Cartesian2: any;
  Cartographic: any;
  Math: any;
  Color: any;
  Matrix4: any;
  Transforms: any;
  ScreenSpaceEventHandler: any;
  ScreenSpaceEventType: any;
  CameraEventType: any;
  SceneMode: any;
  Ellipsoid: any;
  HeadingPitchRange: any;
  IonImageryProvider: any;
  UrlTemplateImageryProvider: any;
  CesiumTerrainProvider: any;
  EllipsoidTerrainProvider: any;
  defined: (value: any) => boolean;
}

export interface TilesetTransformData {
  matrix: number[];
  longitude?: number;
  latitude?: number;
  height?: number;
}

