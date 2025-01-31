// app/hooks/useSceneStore.js
"use client";

import { create } from "zustand";

const useSceneStore = create((set) => ({
  objects: [],
  selectedObject: null,
  observationPoints: [],
  selectedObservation: null,
  addingObservation: false,
  transformMode: "translate",

  addModel: (model) =>
    set((state) => ({
      objects: [...state.objects, { id: state.objects.length, position: [0, 0, 0], ...model }],
    })),

  selectObject: (id, ref) =>
    set((state) => ({
      selectedObject: state.objects.find((obj) => obj.id === id) ? { ...state.objects.find((obj) => obj.id === id), ref } : null,
    })),

  deselectObject: () => set({ selectedObject: null }),

  setModelPosition: (id, newPosition) =>
    set((state) => ({
      objects: state.objects.map((obj) =>
        obj.id === id ? { ...obj, position: newPosition.toArray() } : obj
      ),
    })),

  // ✅ Add observation point WITHOUT capturing camera position
  addObservationPoint: () =>
    set((state) => ({
      observationPoints: [
        ...state.observationPoints,
        {
          id: state.observationPoints.length,
          title: `Observation Point ${state.observationPoints.length + 1}`,
          description: "",
          position: null, // Position is set later
          target: null,   // Target is set later
        },
      ],
    })),

  selectObservationPoint: (id) =>
    set((state) => ({
      selectedObservation: state.observationPoints.find((point) => point.id === id) || null,
    })),

  updateObservationPoint: (id, updates) =>
    set((state) => ({
      observationPoints: state.observationPoints.map((point) =>
        point.id === id ? { ...point, ...updates } : point
      ),
    })),

  deleteObservationPoint: (id) =>
    set((state) => ({
      observationPoints: state.observationPoints.filter((point) => point.id !== id),
      selectedObservation: null,
    })),

  // ✅ Capture camera POV trigger
  capturingPOV: false,
  setCapturingPOV: (value) => set({ capturingPOV: value }),
}));

export default useSceneStore;
