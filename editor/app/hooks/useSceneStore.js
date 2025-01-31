// app/hooks/useSceneStore.js
"use client";

import { create } from "zustand";

const useSceneStore = create((set) => ({
  objects: [], // Stores all 3D models in the scene
  selectedObject: null,
  transformMode: "translate", // Default to movement mode
  observationPoints: [],

  // ✅ Add a model to the scene with default attributes
  addModel: (model) =>
    set((state) => ({
      objects: [
        ...state.objects,
        {
          id: state.objects.length,
          position: [0, 0, 0],
          scale: [1, 1, 1],
          rotation: [0, 0, 0],
          ...model,
        },
      ],
    })),

  // ✅ Select an object and store its reference for TransformControls
  selectObject: (id, ref) =>
    set((state) => ({
      selectedObject: state.objects.find((obj) => obj.id === id) ? { ...state.objects.find((obj) => obj.id === id), ref } : null,
    })),

  // ✅ Deselect object when clicking outside
  deselectObject: () => set({ selectedObject: null }),

  // ✅ Update model position when moved
  setModelPosition: (id, newPosition) =>
    set((state) => ({
      objects: state.objects.map((obj) =>
        obj.id === id ? { ...obj, position: newPosition.toArray() } : obj
      ),
    })),

  // ✅ Update model rotation when rotated
  setModelRotation: (id, newRotation) =>
    set((state) => ({
      objects: state.objects.map((obj) =>
        obj.id === id ? { ...obj, rotation: newRotation.toArray() } : obj
      ),
    })),

  // ✅ Update model scale when resized
  setModelScale: (id, newScale) =>
    set((state) => ({
      objects: state.objects.map((obj) =>
        obj.id === id ? { ...obj, scale: newScale.toArray() } : obj
      ),
    })),

  // ✅ Set Transform Mode (Move, Rotate, Scale)
  setTransformMode: (mode) => set({ transformMode: mode }),

  // ✅ Add an observation point
  addObservationPoint: (point) =>
    set((state) => ({
      observationPoints: [...state.observationPoints, { id: state.observationPoints.length, ...point }],
    })),
}));

export default useSceneStore;
