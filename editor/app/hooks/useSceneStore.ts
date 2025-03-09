import { Vector3 } from "three"; // Assuming you are using three.js for Vector3
import { create } from "zustand";
import * as THREE from "three";
import { v4 as uuidv4 } from 'uuid';

interface Model {
  id: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  [key: string]: any; // For any additional properties
}

interface ObservationPoint {
  id: number;
  title: string;
  description: string;
  position: Vector3 | null;
  target: Vector3 | null;
}

interface SceneState {
  objects: Model[];
  observationPoints: ObservationPoint[];
  selectedObject: Model | null;
  selectedObservation: ObservationPoint | null;
  addingObservation: boolean;
  capturingPOV: boolean;
  previewMode: boolean;
  previewIndex: number;
  transformMode: "translate" | "rotate" | "scale";
  setPreviewMode: (value: boolean) => void;
  setTransformMode: (mode: "translate" | "rotate" | "scale") => void;
  setObjects: (newObjects: Model[]) => void;
  addModel: (model: Partial<Model>) => void;
  selectObject: (id: string, ref: THREE.Object3D | null) => void;
  removeObject: (id: string) => void; // New removal function
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
}

const useSceneStore = create<SceneState>((set) => ({
  // Scene data
  objects: [],
  observationPoints: [],

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
  setObjects: (newObjects) => set({ objects: newObjects }),

  addModel: (model) =>
    set((state) => ({
      objects: [
        ...state.objects,
        {
          id: uuidv4(),
          position: [0, 0, 0],
          ...model,
        },
      ],
    })),
  // Add this in the object actions section of your store:
  removeObject: (id: string) =>
    set((state) => ({
      objects: state.objects.filter((obj) => obj.id !== id),
      selectedObject:
        state.selectedObject && state.selectedObject.id === id
          ? null
          : state.selectedObject,
    })),
  selectObject: (id, ref) =>
  {
    console.info("selectObject", id, ref)
    return   set((state) => ({
      selectedObject: state.objects.find((obj) => obj.id === id)
        ? { ...state.objects.find((obj) => obj.id === id), ref }
        : null,
    }))
  },
  updateModelRef: (id: string, ref: THREE.Object3D | null) =>
    set((state) => ({
      objects: state.objects.map((obj) =>
        obj.id === id ? { ...obj, ref } : obj
      ),
    })),

  deselectObject: () => set({ selectedObject: null }),

  setModelPosition: (id, newPosition) =>
    set((state) => ({
      objects: state.objects.map((obj) =>
        obj.id === id ? { ...obj, position: newPosition.toArray() } : obj
      ),
    })),

  setModelRotation: (id, newRotation) =>
    set((state) => ({
      objects: state.objects.map((obj) =>
        obj.id === id
          ? { ...obj, rotation: [newRotation.x, newRotation.y, newRotation.z] }
          : obj
      ),
    })),

  setModelScale: (id, newScale) =>
    set((state) => ({
      objects: state.objects.map((obj) =>
        obj.id === id
          ? { ...obj, scale: [newScale.x, newScale.y, newScale.z] }
          : obj
      ),
    })),

  // Actions for observation points
  setObservationPoints: (newPoints) => set({ observationPoints: newPoints }),

  addObservationPoint: () =>
    set((state) => ({
      observationPoints: [
        ...state.observationPoints,
        {
          id: state.observationPoints.length, // Again, consider a proper unique id generator
          title: `Observation Point ${state.observationPoints.length + 1}`,
          description: "",
          position: null, // To be set when capturing POV
          target: null, // To be set when capturing POV
        },
      ],
    })),

  selectObservationPoint: (id) =>
    set((state) => ({
      selectedObservation:
        state.observationPoints.find((point) => point.id === id) || null,
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
      selectedObservation: null,
    })),

  // POV Capture
  setCapturingPOV: (value) => set({ capturingPOV: value }),

  // Preview Mode Actions
  startPreview: () =>
    set((state) => ({
      previewMode: true,
      previewIndex: 0, // Start at the first observation point
    })),
  exitPreview: () => set({ previewMode: false }),
  nextObservation: () =>
    set((state) => {
      const nextIndex = Math.min(
        state.previewIndex + 1,
        state.observationPoints.length - 1
      );
      return { previewIndex: nextIndex };
    }),
  prevObservation: () =>
    set((state) => {
      const prevIndex = Math.max(state.previewIndex - 1, 0);
      return { previewIndex: prevIndex };
    }),

  // NEW: Reset the scene state to default values.
  resetScene: () =>
    set({
      objects: [],
      observationPoints: [],
      selectedObject: null,
      selectedObservation: null,
      addingObservation: false,
      capturingPOV: false,
      previewMode: false,
      previewIndex: 0,
      transformMode: "translate",
    }),
}));

export default useSceneStore;
