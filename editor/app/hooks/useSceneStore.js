// app/hooks/useSceneStore.js
"use client";

import {create} from "zustand"; // ✅ Corrected import for Zustand v4

const useSceneStore = create((set) => ({
  objects: [],
  selectedObject: null,
  observationPoints: [],
  addObject: (obj) => set((state) => ({ objects: [...state.objects, obj] })),
  selectObject: (id) =>
    set((state) => ({ selectedObject: state.objects.find((obj) => obj.id === id) })),
  addObservationPoint: (point) =>
    set((state) => ({ observationPoints: [...state.observationPoints, point] })),
}));

export default useSceneStore;
