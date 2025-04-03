import { Vector3 } from "three"; // Assuming you are using three.js for Vector3
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
  [key: string]: any; // For any additional properties
}

interface ObservationPoint {
  id: number;
  title: string;
  description: string;
  position: [number, number, number] | null;
  target: [number, number, number] | null;
}

interface SceneState {
  objects: Model[];
  observationPoints: ObservationPoint[];
  selectedObject: Model | null;
  selectedObservation: ObservationPoint | null;
  selectedAssetId: string;
  selectedLocation: {
    latitude: number;
    longitude: number;
  } | null;
  addingObservation: boolean;
  capturingPOV: boolean;
  previewMode: boolean;
  previewIndex: number;
  transformMode: "translate" | "rotate" | "scale";
  orbitControlsRef: any | null;
  setPreviewMode: (value: boolean) => void;
  setTransformMode: (mode: "translate" | "rotate" | "scale") => void;
  setObjects: (newObjects: Model[]) => void;
  addModel: (model: Partial<Model>) => void;
  selectObject: (id: string, ref: THREE.Object3D | null) => void;
  removeObject: (id: string) => void;
  updateModelRef: (id: string, ref: THREE.Object3D | null) => void;
  deselectObject: () => void;
  setModelPosition: (id: string, newPosition: Vector3) => void;
  setModelRotation: (id: string, newRotation: Vector3) => void;
  setModelScale: (id: string, newScale: Vector3) => void;
  setObservationPoints: (newPoints: ObservationPoint[]) => void;
  addObservationPoint: () => void;
  selectObservationPoint: (id: number) => void;
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
  addGoogleTiles: (apiKey: string) => void;
  addCesiumIonTiles: () => void;
  setSelectedAssetId: (assetId: string) => void;
  setSelectedLocation: (
    location: { latitude: number; longitude: number } | null
  ) => void;
}

const useSceneStore = create<SceneState>((set) => ({
  // Scene data
  objects: [],
  observationPoints: [],
  orbitControlsRef: null,
  selectedAssetId: "2275207", // Default to Tokyo Tower
  selectedLocation: null,

  // Selected items
  selectedObject: null,
  selectedObservation: null,

  // State flags
  addingObservation: false,
  capturingPOV: false,
  previewMode: false,
  previewIndex: 0,
  setPreviewMode: (value) => set({ previewMode: value }),

  // Transform mode (translate, rotate, scale)
  transformMode: "translate",

  // Actions for updating transform mode
  setTransformMode: (mode) => set({ transformMode: mode }),

  // Actions for scene objects (models)
  setObjects: (newObjects) => {
    console.log("Setting objects:", newObjects);
    set({ objects: newObjects });
  },

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
      };

      console.log("Adding new model:", newModel);
      const updatedObjects = [...state.objects, newModel];
      console.log("Updated objects array:", updatedObjects);
      return { objects: updatedObjects };
    }),

  addGoogleTiles: (apiKey) =>
    set((_state) => {
      const newModel: Model = {
        id: uuidv4(),
        name: "Google Photorealistic Tiles",
        type: "tiles",
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        apiKey,
        component: "TilesRenderer",
      };
      return { objects: [..._state.objects, newModel] };
    }),

  addCesiumIonTiles: () => {
    set((state) => {
      const newModel: Model = {
        id: `tiles-${Date.now()}`,
        name: "Cesium Ion Tiles",
        url: "https://assets.ion.cesium.com/1/",
        type: "tiles",
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        assetId: "2275207", // Tokyo Tower asset ID
      };

      console.log("Adding new Cesium Ion tiles:", newModel);
      return {
        objects: [...state.objects, newModel],
      };
    });
  },

  removeObject: (id: string) =>
    set((state) => {
      console.log("Removing object:", id);
      const updatedObjects = state.objects.filter((obj) => obj.id !== id);
      console.log("Updated objects after removal:", updatedObjects);
      return {
        objects: updatedObjects,
        selectedObject:
          state.selectedObject && state.selectedObject.id === id
            ? null
            : state.selectedObject,
      };
    }),

  selectObject: (id, ref) => {
    console.log("Selecting object:", { id, ref });
    return set((state) => {
      const selectedObject = state.objects.find((obj) => obj.id === id)
        ? { ...state.objects.find((obj) => obj.id === id), ref }
        : null;
      console.log("Selected object:", selectedObject);
      return { selectedObject };
    });
  },

  updateModelRef: (id: string, ref: THREE.Object3D | null) => {
    console.log("Updating model ref:", { id, ref });
    return set((state) => {
      const updatedObjects = state.objects.map((obj) =>
        obj.id === id ? { ...obj, ref } : obj
      );
      console.log("Updated objects with ref:", updatedObjects);
      return { objects: updatedObjects };
    });
  },

  deselectObject: () => set({ selectedObject: null }),

  setModelPosition: (id, newPosition) =>
    set((state) => {
      console.log("Setting model position:", {
        id,
        position: newPosition.toArray(),
      });
      const updatedObjects = state.objects.map((obj) =>
        obj.id === id
          ? {
              ...obj,
              position: newPosition.toArray() as [number, number, number],
            }
          : obj
      );
      console.log("Updated objects with position:", updatedObjects);
      return { objects: updatedObjects };
    }),

  setModelRotation: (id, newRotation) =>
    set((state) => {
      console.log("Setting model rotation:", {
        id,
        rotation: [newRotation.x, newRotation.y, newRotation.z],
      });
      const updatedObjects = state.objects.map((obj) =>
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
      );
      console.log("Updated objects with rotation:", updatedObjects);
      return { objects: updatedObjects };
    }),

  setModelScale: (id, newScale) =>
    set((state) => {
      console.log("Setting model scale:", {
        id,
        scale: [newScale.x, newScale.y, newScale.z],
      });
      const updatedObjects = state.objects.map((obj) =>
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
      );
      console.log("Updated objects with scale:", updatedObjects);
      return { objects: updatedObjects };
    }),

  // Actions for observation points
  setObservationPoints: (newPoints) => {
    console.log("Setting observation points:", newPoints);
    set({ observationPoints: newPoints });
  },

  addObservationPoint: () =>
    set((state) => {
      const newPoint = {
        id: Date.now(),
        title: "New Observation Point",
        description: "",
        position: null,
        target: null,
      };
      console.log("Adding new observation point:", newPoint);
      return {
        observationPoints: [...state.observationPoints, newPoint],
      };
    }),

  selectObservationPoint: (id) => {
    console.log("Selecting observation point:", id);
    return set((state) => {
      const selectedObservation = state.observationPoints.find(
        (point) => point.id === id
      );
      console.log("Selected observation point:", selectedObservation);
      return { selectedObservation };
    });
  },

  updateObservationPoint: (id, updates) =>
    set((state) => {
      console.log("Updating observation point:", { id, updates });
      const updatedPoints = state.observationPoints.map((point) =>
        point.id === id ? { ...point, ...updates } : point
      );
      console.log("Updated observation points:", updatedPoints);
      return { observationPoints: updatedPoints };
    }),

  deleteObservationPoint: (id) =>
    set((state) => {
      console.log("Deleting observation point:", id);
      const updatedPoints = state.observationPoints.filter(
        (point) => point.id !== id
      );
      console.log("Updated observation points after deletion:", updatedPoints);
      return {
        observationPoints: updatedPoints,
        selectedObservation:
          state.selectedObservation && state.selectedObservation.id === id
            ? null
            : state.selectedObservation,
      };
    }),

  // POV Capture
  setCapturingPOV: (value) => set({ capturingPOV: value }),

  // Preview Mode Actions
  startPreview: () => set({ previewMode: true, previewIndex: 0 }),
  exitPreview: () => set({ previewMode: false, previewIndex: 0 }),
  nextObservation: () =>
    set((state) => {
      if (
        state.observationPoints.length > 0 &&
        state.previewIndex < state.observationPoints.length - 1
      ) {
        return { previewIndex: state.previewIndex + 1 };
      }
      return state;
    }),
  prevObservation: () =>
    set((state) => {
      if (state.observationPoints.length > 0 && state.previewIndex > 0) {
        return { previewIndex: state.previewIndex - 1 };
      }
      return state;
    }),

  // NEW: Reset the scene state to default values.
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
    }),

  // Set orbit controls reference
  setOrbitControlsRef: (ref) => set({ orbitControlsRef: ref }),

  setSelectedAssetId: (assetId) => set({ selectedAssetId: assetId }),

  setSelectedLocation: (location) => set({ selectedLocation: location }),
}));

export default useSceneStore;
