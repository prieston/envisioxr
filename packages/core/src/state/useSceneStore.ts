import { Vector3 } from "three";
import { create } from "zustand";
import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";

interface CesiumIonAsset {
  id: string;
  name: string;
  apiKey: string;
  assetId: string;
  enabled: boolean;
}

interface Model {
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
  material?: {
    color?: string;
    [key: string]: any;
  };
  isObservationModel?: boolean;
  observationProperties?: {
    sensorType: "cone" | "rectangle";
    fov: number;
    fovH?: number;
    fovV?: number;
    visibilityRadius: number;
    showSensorGeometry: boolean;
    showViewshed: boolean;
    sensorColor?: string;
    viewshedColor?: string;
    analysisQuality: "low" | "medium" | "high";
    raysAzimuth?: number;
    raysElevation?: number;
    clearance?: number;
    stepCount?: number;
    enableTransformEditor: boolean;
    alignWithModelFront: boolean;
    manualFrontDirection?: "x" | "y" | "z" | "negX" | "negY" | "negZ";
    include3DModels?: boolean;
    modelFrontAxis?: "X+" | "X-" | "Y+" | "Y-" | "Z+" | "Z-";
    sensorForwardAxis?: "X+" | "X-" | "Y+" | "Y-" | "Z+" | "Z-";
    tiltDeg?: number;
  };
  iotProperties?: {
    enabled: boolean;
    serviceType: string;
    apiEndpoint: string;
    updateInterval: number;
    showInScene: boolean;
    displayFormat: "compact" | "detailed" | "minimal";
    autoRefresh: boolean;
  };
  weatherData?: {
    temperature: number;
    windSpeed: number;
    windDirection: number;
    humidity: number;
    pressure: number;
    description: string;
    lastUpdated: Date | string;
  } | null;
  [key: string]: any;
}

interface ObservationPoint {
  id: number;
  title: string;
  description: string;
  position: [number, number, number] | null;
  target: [number, number, number] | null;
}

export type ViewMode =
  | "orbit"
  | "explore"
  | "firstPerson"
  | "thirdPerson"
  | "flight"
  | "thirdPersonFlight"
  | "car"
  | "thirdPersonCar"
  | "settings";

interface SceneState {
  objects: Model[];
  observationPoints: ObservationPoint[];
  selectedObject: Model | null;
  selectedObservation: ObservationPoint | null;
  selectedAssetId: string;
  selectedLocation: {
    latitude: number;
    longitude: number;
    altitude?: number;
  } | null;
  tilesRenderer: any | null;
  cesiumIonAssets: CesiumIonAsset[];
  cesiumViewer: any | null;
  cesiumInstance: any | null;
  basemapType: "cesium" | "google" | "google-photorealistic" | "bing" | "none";
  gridEnabled: boolean;
  ambientLightIntensity: number;
  skyboxType: "default" | "none";
  showTiles: boolean;
  magnetEnabled: boolean;
  // Time simulation settings
  cesiumLightingEnabled: boolean;
  cesiumShadowsEnabled: boolean;
  cesiumCurrentTime: string | null; // ISO string
  viewMode: ViewMode;
  isThirdPerson: boolean;
  isPlaying: boolean;
  playbackSpeed: number;
  setPreviewIndex: (index: number) => void;
  addingObservation: boolean;
  capturingPOV: boolean;
  previewMode: boolean;
  previewIndex: number;
  transformMode: "translate" | "rotate" | "scale";
  orbitControlsRef: any | null;
  scene: THREE.Scene | null;
  setGridEnabled: (enabled: boolean) => void;
  setAmbientLightIntensity: (intensity: number) => void;
  setSkyboxType: (type: "default" | "none") => void;
  setShowTiles: (show: boolean) => void;
  setMagnetEnabled: (enabled: boolean) => void;
  setCesiumViewer: (viewer: any) => void;
  setCesiumInstance: (instance: any) => void;
  setBasemapType: (
    type: "cesium" | "google" | "google-photorealistic" | "bing" | "none"
  ) => void;
  setViewMode: (mode: ViewMode) => void;
  togglePlayback: () => void;
  setPlaybackSpeed: (speed: number) => void;
  // Time simulation setters
  setCesiumLightingEnabled: (enabled: boolean) => void;
  setCesiumShadowsEnabled: (enabled: boolean) => void;
  setCesiumCurrentTime: (time: string | null) => void;
  setPreviewMode: (value: boolean) => void;
  setTransformMode: (mode: "translate" | "rotate" | "scale") => void;
  setObjects: (newObjects: Model[]) => void;
  addModel: (model: Partial<Model>) => void;
  selectObject: (id: string, ref: THREE.Object3D | null) => void;
  removeObject: (id: string) => void;
  updateObjectProperty: (id: string, property: string, value: any) => void;
  updateModelRef: (id: string, ref: THREE.Object3D | null) => void;
  deselectObject: () => void;
  setModelPosition: (id: string, newPosition: Vector3) => void;
  setModelRotation: (id: string, newRotation: Vector3) => void;
  setModelScale: (id: string, newScale: Vector3) => void;
  setObservationPoints: (newPoints: ObservationPoint[]) => void;
  addObservationPoint: () => void;
  selectObservation: (id: number) => void;
  updateObservationPoint: (
    id: number,
    updates: Partial<ObservationPoint>
  ) => void;
  deleteObservationPoint: (id: number) => void;
  setCapturingPOV: (value: boolean) => void;
  startPreview: () => void;
  exitPreview: () => void;
  nextObservation: () => void;
  prevObservation: () => void;
  resetScene: () => void;
  setOrbitControlsRef: (ref: any) => void;
  setScene: (scene: THREE.Scene) => void;
  setTilesRenderer: (renderer: any) => void;
  addGoogleTiles: (apiKey: string) => void;
  addCesiumIonTiles: () => void;
  setSelectedAssetId: (assetId: string) => void;
  setSelectedLocation: (
    location: { latitude: number; longitude: number } | null
  ) => void;
  controlSettings: {
    carSpeed: number;
    walkSpeed: number;
    flightSpeed: number;
    turnSpeed: number;
    smoothness: number;
  };
  updateControlSettings: (
    settings: Partial<SceneState["controlSettings"]>
  ) => void;
  isCalculatingVisibility: boolean;
  lastVisibilityCalculation: { objectId: string; timestamp: number } | null;
  startVisibilityCalculation: (objectId: string) => void;
  finishVisibilityCalculation: (objectId: string) => void;
  updateWeatherData: (
    objectId: string,
    weatherData: Model["weatherData"]
  ) => void;
  addCesiumIonAsset: (asset: Omit<CesiumIonAsset, "id">) => void;
  removeCesiumIonAsset: (id: string) => void;
  updateCesiumIonAsset: (id: string, updates: Partial<CesiumIonAsset>) => void;
  toggleCesiumIonAsset: (id: string) => void;
  setCesiumIonAssets: (assets: CesiumIonAsset[]) => void;
  flyToCesiumIonAsset: (assetId: string) => void;
}

const findIntersectionPoint = (
  scene: THREE.Scene,
  camera: THREE.Camera
): [number, number, number] => {
  const raycaster = new THREE.Raycaster();
  const cameraPosition = camera.position.clone();
  const cameraTarget = new THREE.Vector3(0, 0, -1).unproject(camera);
  const direction = cameraTarget.sub(cameraPosition).normalize();
  raycaster.set(cameraPosition, direction);
  const allMeshes: THREE.Mesh[] = [];
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      allMeshes.push(object);
    }
  });
  const intersects = raycaster.intersectObjects(allMeshes);
  if (intersects.length > 0) {
    const hitPoint = intersects[0].point;
    return [hitPoint.x, hitPoint.y, hitPoint.z];
  }
  return [0, 0, 0];
};

const useSceneStore = create<SceneState>((set) => ({
  objects: [],
  observationPoints: [],
  selectedObject: null,
  selectedObservation: null,
  selectedAssetId: "2275207",
  selectedLocation: null,
  orbitControlsRef: null,
  scene: null,
  tilesRenderer: null,
  cesiumIonAssets: [],
  cesiumViewer: null,
  cesiumInstance: null,
  basemapType: "none",
  gridEnabled: true,
  ambientLightIntensity: 0.5,
  skyboxType: "default",
  showTiles: false,
  magnetEnabled: false,
  viewMode: "orbit",
  isThirdPerson: false,
  isPlaying: false,
  playbackSpeed: 1,
  previewIndex: 0,
  addingObservation: false,
  capturingPOV: false,
  previewMode: false,
  transformMode: "translate",
  // Time simulation defaults
  cesiumLightingEnabled: false,
  cesiumShadowsEnabled: false,
  cesiumCurrentTime: null,
  setGridEnabled: (enabled) => set({ gridEnabled: enabled }),
  setAmbientLightIntensity: (intensity) =>
    set({ ambientLightIntensity: intensity }),
  setSkyboxType: (type) => set({ skyboxType: type }),
  setShowTiles: (show) => set({ showTiles: show }),
  setMagnetEnabled: (enabled) => set({ magnetEnabled: enabled }),
  setCesiumViewer: (viewer) => set({ cesiumViewer: viewer }),
  setCesiumInstance: (instance) => set({ cesiumInstance: instance }),
  setBasemapType: (type) => set({ basemapType: type }),
  setViewMode: (mode) => set({ viewMode: mode }),
  togglePlayback: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  setPreviewIndex: (index) => set({ previewIndex: index }),
  // Time simulation setters
  setCesiumLightingEnabled: (enabled) =>
    set({ cesiumLightingEnabled: enabled }),
  setCesiumShadowsEnabled: (enabled) => set({ cesiumShadowsEnabled: enabled }),
  setCesiumCurrentTime: (time) => set({ cesiumCurrentTime: time }),
  setPreviewMode: (value) => set({ previewMode: value }),
  setTransformMode: (mode) => set({ transformMode: mode }),
  setObjects: (newObjects) => set({ objects: newObjects }),
  addModel: (model) =>
    set((state) => {
      try {
      } catch {}
      const camera = state.orbitControlsRef?.object;
      let position: [number, number, number] = [0, 0, 0];
      let coordinateSystem = "local";
      if (state.scene && camera) {
        position = findIntersectionPoint(state.scene, camera);
      } else if (model.position) {
        position = model.position;
        const [x, y, z] = model.position;
        const isGeographic =
          x >= -180 && x <= 180 && y >= -90 && y <= 90 && Math.abs(z) < 50000;
        coordinateSystem = isGeographic ? "geographic" : "local";
      }
      const newModel = {
        id: uuidv4(),
        name: model.name || "",
        url: model.url || "",
        type: model.type || "model",
        position,
        rotation: model.rotation || [0, 0, 0],
        scale: model.scale || [1, 1, 1],
        apiKey: model.apiKey,
        assetId: model.assetId,
        material: model.material || { color: "#ffffff" },
        coordinateSystem,
        isObservationModel: model.isObservationModel || false,
        observationProperties: model.observationProperties,
      };
      const nextObjects = [...state.objects, newModel];
      try {
      } catch {}
      return { objects: nextObjects };
    }),
  selectObject: (id, ref) =>
    set((state) => {
      const found = state.objects.find((obj) => obj.id === id);
      return {
        selectedObject: found ? (found as any) : null,
      } as any;
    }),
  removeObject: (id) =>
    set((state) => ({
      objects: state.objects.filter((obj) => obj.id !== id),
      selectedObject:
        state.selectedObject?.id === id ? null : state.selectedObject,
    })),
  updateObjectProperty: (id, property, value) => {
    set((state) => {
      const updatedObjects = state.objects.map((obj) => {
        if (obj.id === id) {
          if (property.includes(".")) {
            const [parent, child] = property.split(".");
            if (
              parent === "observationProperties" &&
              !obj.observationProperties
            ) {
              const observationProps = {
                sensorType: "cone" as "cone" | "rectangle",
                fov: 60,
                visibilityRadius: 500,
                showSensorGeometry: true,
                showViewshed: false,
                analysisQuality: "medium" as "low" | "medium" | "high",
                enableTransformEditor: true,
                alignWithModelFront: true,
                sensorColor: "#00ff00",
                viewshedColor: "#0080ff",
                clearance: 2.0,
                raysElevation: 8,
                stepCount: 64,
              } as any;
              if (
                child === "sensorType" &&
                (value === "cone" || value === "rectangle")
              ) {
                observationProps.sensorType = value as "cone" | "rectangle";
              } else if (
                child === "analysisQuality" &&
                (value === "low" || value === "medium" || value === "high")
              ) {
                observationProps.analysisQuality = value as
                  | "low"
                  | "medium"
                  | "high";
              } else {
                (observationProps as any)[child] = value;
              }
              return { ...obj, observationProperties: observationProps };
            }
            return {
              ...obj,
              [parent]: { ...obj[parent], [child]: value },
            } as any;
          }
          if (
            property === "isObservationModel" &&
            value === true &&
            !obj.observationProperties
          ) {
            return {
              ...obj,
              [property]: value,
              observationProperties: {
                sensorType: "cone" as "cone" | "rectangle",
                fov: 60,
                visibilityRadius: 500,
                showSensorGeometry: true,
                showViewshed: false,
                analysisQuality: "medium" as "low" | "medium" | "high",
                enableTransformEditor: true,
                alignWithModelFront: true,
                sensorColor: "#00ff00",
                viewshedColor: "#0080ff",
                clearance: 2.0,
                raysAzimuth: 120,
                raysElevation: 8,
                stepCount: 64,
              },
            } as any;
          }
          return { ...obj, [property]: value } as any;
        }
        return obj;
      });
      const updatedSelectedObject =
        state.selectedObject?.id === id
          ? updatedObjects.find((obj) => obj.id === id)
          : state.selectedObject;
      return { objects: updatedObjects, selectedObject: updatedSelectedObject };
    });
  },
  updateModelRef: (id, ref) =>
    set((state) => ({
      objects: state.objects.map((obj) =>
        obj.id === id ? { ...obj, ref } : obj
      ),
    })),
  deselectObject: () => set({ selectedObject: null }),
  setModelPosition: (id, newPosition) =>
    set((state) => ({
      objects: state.objects.map((obj) =>
        obj.id === id
          ? {
              ...obj,
              position: newPosition.toArray() as [number, number, number],
            }
          : obj
      ),
    })),
  setModelRotation: (id, newRotation) =>
    set((state) => ({
      objects: state.objects.map((obj) =>
        obj.id === id
          ? {
              ...obj,
              rotation: [newRotation.x, newRotation.y, newRotation.z] as [
                number,
                number,
                number,
              ],
            }
          : obj
      ),
    })),
  setModelScale: (id, newScale) =>
    set((state) => ({
      objects: state.objects.map((obj) =>
        obj.id === id
          ? {
              ...obj,
              scale: [newScale.x, newScale.y, newScale.z] as [
                number,
                number,
                number,
              ],
            }
          : obj
      ),
    })),
  setObservationPoints: (newPoints) => set({ observationPoints: newPoints }),
  addObservationPoint: () =>
    set((state) => {
      const id = Date.now();
      let position: [number, number, number] | null = null;
      let target: [number, number, number] | null = null;

      // Three.js camera capture
      const threeCamera: any = state.orbitControlsRef?.object;
      if (state.scene && threeCamera) {
        const camPos = threeCamera.position as THREE.Vector3;
        const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(
          threeCamera.quaternion
        );
        const lookAt = camPos.clone().add(dir.multiplyScalar(10));
        position = [camPos.x, camPos.y, camPos.z];
        target = [lookAt.x, lookAt.y, lookAt.z];
      }

      // Cesium camera capture (fallback when available)
      if (
        (!position || !target) &&
        state.cesiumViewer &&
        state.cesiumInstance
      ) {
        try {
          const ci: any = state.cesiumInstance;
          const camera = (state.cesiumViewer as any).camera;
          const posEC = camera.position;
          const dirEC = camera.direction;
          const carto = ci.Cartographic.fromCartesian(posEC);
          const lon = ci.Math.toDegrees(carto.longitude);
          const lat = ci.Math.toDegrees(carto.latitude);
          const h = carto.height;
          position = [lon, lat, h];
          const ahead = ci.Cartesian3.add(
            posEC,
            ci.Cartesian3.multiplyByScalar(dirEC, 10, new ci.Cartesian3()),
            new ci.Cartesian3()
          );
          const cartoT = ci.Cartographic.fromCartesian(ahead);
          const lonT = ci.Math.toDegrees(cartoT.longitude);
          const latT = ci.Math.toDegrees(cartoT.latitude);
          const hT = cartoT.height;
          target = [lonT, latT, hT];
        } catch {
          // ignore cesium capture errors
        }
      }

      const newPoint = {
        id,
        title: "New Observation Point",
        description: "",
        position: position ?? null,
        target: target ?? null,
      } as const;

      const observationPoints = [...state.observationPoints, newPoint];
      const previewIndex = observationPoints.length - 1;

      return {
        observationPoints,
        selectedObservation: newPoint,
        previewIndex,
      } as any;
    }),
  selectObservation: (id) =>
    set((state) => ({
      selectedObservation: state.observationPoints.find(
        (point) => point.id === id
      ),
    })),
  updateObservationPoint: (id, updates) =>
    set((state) => {
      const updatedPoints = state.observationPoints.map((point) =>
        point.id === id ? { ...point, ...updates } : point
      );
      const updatedSelected =
        state.selectedObservation?.id === id
          ? { ...state.selectedObservation, ...updates }
          : state.selectedObservation;
      return {
        observationPoints: updatedPoints,
        selectedObservation: updatedSelected,
      };
    }),
  deleteObservationPoint: (id) =>
    set((state) => ({
      observationPoints: state.observationPoints.filter(
        (point) => point.id !== id
      ),
      selectedObservation:
        state.selectedObservation?.id === id ? null : state.selectedObservation,
    })),
  setCapturingPOV: (value) => set({ capturingPOV: value }),
  startPreview: () => set({ previewMode: true, previewIndex: 0 }),
  exitPreview: () => set({ previewMode: false, previewIndex: 0 }),
  nextObservation: () =>
    set((state) => ({
      previewIndex:
        state.previewIndex < state.observationPoints.length - 1
          ? state.previewIndex + 1
          : state.previewIndex,
    })),
  prevObservation: () =>
    set((state) => ({
      previewIndex:
        state.previewIndex > 0 ? state.previewIndex - 1 : state.previewIndex,
    })),
  resetScene: () =>
    set({
      objects: [],
      observationPoints: [],
      selectedObject: null,
      selectedObservation: null,
      selectedAssetId: "2275207",
      selectedLocation: null,
      previewMode: false,
      previewIndex: 0,
      gridEnabled: true,
      ambientLightIntensity: 0.5,
      skyboxType: "default",
      viewMode: "orbit",
      isPlaying: false,
      playbackSpeed: 1,
      tilesRenderer: null,
      cesiumIonAssets: [],
      cesiumLightingEnabled: false,
      cesiumShadowsEnabled: false,
      cesiumCurrentTime: null,
    }),
  setOrbitControlsRef: (ref) => set({ orbitControlsRef: ref }),
  setScene: (scene) => set({ scene }),
  setTilesRenderer: (renderer) => set({ tilesRenderer: renderer }),
  addGoogleTiles: (apiKey) =>
    set((state) => ({
      objects: [
        ...state.objects,
        {
          id: uuidv4(),
          name: "Google Photorealistic Tiles",
          type: "tiles",
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          apiKey,
          component: "TilesRenderer",
        },
      ],
    })),
  addCesiumIonTiles: () =>
    set((state) => ({
      objects: [
        ...state.objects,
        {
          id: uuidv4(),
          name: "Cesium Ion Tiles",
          url: "https://assets.ion.cesium.com/1/",
          type: "tiles",
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          assetId: "2275207",
        },
      ],
    })),
  setSelectedAssetId: (assetId) => set({ selectedAssetId: assetId }),
  setSelectedLocation: (location) => set({ selectedLocation: location }),
  controlSettings: {
    carSpeed: 54,
    walkSpeed: 20,
    flightSpeed: 100,
    turnSpeed: 0.02,
    smoothness: 0.05,
  },
  updateControlSettings: (settings) =>
    set((state) => ({
      controlSettings: { ...state.controlSettings, ...settings },
    })),
  isCalculatingVisibility: false,
  lastVisibilityCalculation: null,
  startVisibilityCalculation: (objectId) =>
    set({
      isCalculatingVisibility: true,
      lastVisibilityCalculation: { objectId, timestamp: Date.now() },
    }),
  finishVisibilityCalculation: (_objectId) =>
    set({ isCalculatingVisibility: false }),
  updateWeatherData: (objectId, weatherData) =>
    set((state) => ({
      objects: state.objects.map((obj) =>
        obj.id === objectId ? { ...obj, weatherData } : obj
      ),
      selectedObject:
        state.selectedObject?.id === objectId
          ? { ...state.selectedObject, weatherData }
          : state.selectedObject,
    })),
  addCesiumIonAsset: (asset) =>
    set((state) => ({
      cesiumIonAssets: [...state.cesiumIonAssets, { ...asset, id: uuidv4() }],
    })),
  removeCesiumIonAsset: (id) =>
    set((state) => ({
      cesiumIonAssets: state.cesiumIonAssets.filter((asset) => asset.id !== id),
    })),
  updateCesiumIonAsset: (id, updates) =>
    set((state) => ({
      cesiumIonAssets: state.cesiumIonAssets.map((asset) =>
        asset.id === id ? { ...asset, ...updates } : asset
      ),
    })),
  toggleCesiumIonAsset: (id) =>
    set((state) => ({
      cesiumIonAssets: state.cesiumIonAssets.map((asset) =>
        asset.id === id ? { ...asset, enabled: !asset.enabled } : asset
      ),
    })),
  setCesiumIonAssets: (assets) => set({ cesiumIonAssets: assets }),
  flyToCesiumIonAsset: (assetId) => {
    const state = useSceneStore.getState();
    const asset = state.cesiumIonAssets.find((a) => a.id === assetId);
    const cesiumViewer = state.cesiumViewer;
    const cesiumInstance = state.cesiumInstance;
    if (!asset || !cesiumViewer || !cesiumInstance) {
      console.warn(
        "Asset, Cesium viewer, or Cesium instance not available for fly-to"
      );
      return;
    }
    const primitives = (cesiumViewer as any).scene.primitives;
    let targetTileset: any = null;
    for (let i = 0; i < primitives.length; i++) {
      const primitive = primitives.get(i);
      if (
        primitive &&
        (primitive as any).assetId === parseInt((asset as any).assetId)
      ) {
        targetTileset = primitive;
        break;
      }
    }
    if (!targetTileset) {
      console.warn(
        `[CesiumIon] Could not find tileset for asset: ${(asset as any).name} (${(asset as any).assetId})`
      );
      return;
    }
    try {
      (cesiumViewer as any).flyTo(targetTileset, {
        duration: 2.0,
        offset: new (cesiumInstance as any).HeadingPitchRange(0, -0.5, 1000),
      });
    } catch (error) {
      // Error flying to asset
    }
  },
}));

export default useSceneStore;
