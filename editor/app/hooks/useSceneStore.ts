import { Vector3 } from "three";
import { create } from "zustand";
import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";

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
  [key: string]: any;
}

interface ObservationPoint {
  id: number;
  title: string;
  description: string;
  position: [number, number, number] | null;
  target: [number, number, number] | null;
}

export type ViewMode = "orbit" | "firstPerson" | "thirdPerson" | "flight";

interface SceneState {
  // Scene Objects
  objects: Model[];
  observationPoints: ObservationPoint[];
  selectedObject: Model | null;
  selectedObservation: ObservationPoint | null;
  selectedAssetId: string;
  selectedLocation: {
    latitude: number;
    longitude: number;
  } | null;

  // Environment Settings
  gridEnabled: boolean;
  ambientLightIntensity: number;
  skyboxType: "default" | "hdri" | "gradient" | "none";
  showTiles: boolean;

  // View Mode
  viewMode: ViewMode;

  // Playback State
  isPlaying: boolean;
  playbackSpeed: number;
  setPreviewIndex: (index: number) => void;

  // UI State
  addingObservation: boolean;
  capturingPOV: boolean;
  previewMode: boolean;
  previewIndex: number;
  transformMode: "translate" | "rotate" | "scale";
  orbitControlsRef: any | null;

  // Environment Actions
  setGridEnabled: (enabled: boolean) => void;
  setAmbientLightIntensity: (intensity: number) => void;
  setSkyboxType: (type: "default" | "hdri" | "gradient" | "none") => void;
  setShowTiles: (show: boolean) => void;

  // View Mode Actions
  setViewMode: (mode: ViewMode) => void;

  // Playback Actions
  togglePlayback: () => void;
  setPlaybackSpeed: (speed: number) => void;
  setPreviewIndex: (index: number) => void;

  // Scene Object Actions
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

  // Observation Point Actions
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

  // Other Actions
  resetScene: () => void;
  setOrbitControlsRef: (ref: any) => void;
  addGoogleTiles: (apiKey: string) => void;
  addCesiumIonTiles: () => void;
  setSelectedAssetId: (assetId: string) => void;
  setSelectedLocation: (
    location: { latitude: number; longitude: number } | null
  ) => void;
}

const useSceneStore = create<SceneState>((set) => ({
  // Initial State
  objects: [],
  observationPoints: [],
  selectedObject: null,
  selectedObservation: null,
  selectedAssetId: "2275207",
  selectedLocation: null,
  orbitControlsRef: null,

  // Environment Settings Initial State
  gridEnabled: true,
  ambientLightIntensity: 0.5,
  skyboxType: "default",
  showTiles: false,

  // View Mode Initial State
  viewMode: "orbit",

  // Playback Initial State
  isPlaying: false,
  playbackSpeed: 1,
  previewIndex: 0,

  // UI Initial State
  addingObservation: false,
  capturingPOV: false,
  previewMode: false,
  transformMode: "translate",

  // Environment Actions
  setGridEnabled: (enabled) => set({ gridEnabled: enabled }),
  setAmbientLightIntensity: (intensity) =>
    set({ ambientLightIntensity: intensity }),
  setSkyboxType: (type) => set({ skyboxType: type }),
  setShowTiles: (show) => set({ showTiles: show }),

  // View Mode Actions
  setViewMode: (mode) => set({ viewMode: mode }),

  // Playback Actions
  togglePlayback: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  setPreviewIndex: (index) => set({ previewIndex: index }),

  // Scene Object Actions
  setPreviewMode: (value) => set({ previewMode: value }),
  setTransformMode: (mode) => set({ transformMode: mode }),
  setObjects: (newObjects) => set({ objects: newObjects }),

  addModel: (model) =>
    set((state) => {
      const newModel = {
        id: uuidv4(),
        name: model.name || "",
        url: model.url || "",
        type: model.type || "model",
        position: model.position || [0, 0, 0],
        rotation: model.rotation || [0, 0, 0],
        scale: model.scale || [1, 1, 1],
        apiKey: model.apiKey,
        assetId: model.assetId,
        material: model.material || { color: "#ffffff" },
      };
      return { objects: [...state.objects, newModel] };
    }),

  selectObject: (id, ref) =>
    set((state) => ({
      selectedObject: state.objects.find((obj) => obj.id === id)
        ? { ...state.objects.find((obj) => obj.id === id), ref }
        : null,
    })),

  removeObject: (id) =>
    set((state) => ({
      objects: state.objects.filter((obj) => obj.id !== id),
      selectedObject:
        state.selectedObject?.id === id ? null : state.selectedObject,
    })),

  updateObjectProperty: (id, property, value) =>
    set((state) => ({
      objects: state.objects.map((obj) =>
        obj.id === id
          ? {
              ...obj,
              [property]: value,
            }
          : obj
      ),
    })),

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

  // Observation Point Actions
  setObservationPoints: (newPoints) => set({ observationPoints: newPoints }),

  addObservationPoint: () =>
    set((state) => ({
      observationPoints: [
        ...state.observationPoints,
        {
          id: Date.now(),
          title: "New Observation Point",
          description: "",
          position: null,
          target: null,
        },
      ],
    })),

  selectObservation: (id) =>
    set((state) => ({
      selectedObservation: state.observationPoints.find(
        (point) => point.id === id
      ),
    })),

  updateObservationPoint: (id, updates) =>
    set((state) => ({
      observationPoints: state.observationPoints.map((point) =>
        point.id === id ? { ...point, ...updates } : point
      ),
    })),

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

  // Other Actions
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
    }),

  setOrbitControlsRef: (ref) => set({ orbitControlsRef: ref }),

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
}));

export default useSceneStore;
