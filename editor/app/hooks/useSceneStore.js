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

  // ✅ NEW: Preview State
  previewMode: false,
  previewIndex: 0,

  setTransformMode: (mode) => set({ transformMode: mode }),

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

  // ✅ Observation Points
  addObservationPoint: () =>
    set((state) => ({
      observationPoints: [
        ...state.observationPoints,
        {
          id: state.observationPoints.length,
          title: `Observation Point ${state.observationPoints.length + 1}`,
          description: "",
          position: null, // To be set when capturing POV
          target: null,   // To be set when capturing POV
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

  // ✅ POV Capture
  capturingPOV: false,
  setCapturingPOV: (value) => set({ capturingPOV: value }),

  // ✅ Preview Mode Actions
  startPreview: () =>
    set((state) => ({
      previewMode: true,
      previewIndex: 0, // Start at the first observation point
    })),
  exitPreview: () => set({ previewMode: false }),
  nextObservation: () =>
    set((state) => {
      const nextIndex = Math.min(state.previewIndex + 1, state.observationPoints.length - 1);
      return { previewIndex: nextIndex };
    }),
  prevObservation: () =>
    set((state) => {
      const prevIndex = Math.max(state.previewIndex - 1, 0);
      return { previewIndex: prevIndex };
    }),
}));

export default useSceneStore;
