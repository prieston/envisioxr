// app/hooks/useSceneStore.js
"use client";

import { create } from "zustand"; // ✅ Corrected import for Zustand v4

const useSceneStore = create((set) => ({
  objects: [], // Stores all 3D models in the scene
  selectedObject: null,
  observationPoints: [],

  // ✅ Add a model to the scene
  addModel: (model) =>
    set((state) => ({
      objects: [...state.objects, { id: state.objects.length, ...model }],
    })),

  // ✅ Select an object from the list
  selectObject: (id) =>
    set((state) => ({
      selectedObject: state.objects.find((obj) => obj.id === id) || null,
    })),

  // ✅ Add an observation point
  addObservationPoint: (point) =>
    set((state) => ({ observationPoints: [...state.observationPoints, point] })),
}));

export default useSceneStore;
