import { PanelConfiguration } from "../types/panelConfig";

export const createThreeJSBottomPanelConfig = (
  viewMode: string,
  setViewMode: (mode: string) => void,
  isPlaying: boolean,
  togglePlayback: () => void,
  observationPoints: any[],
  selectedObservation: any,
  addObservationPoint: () => void,
  selectObservation: (id: number) => void,
  nextObservation: () => void,
  prevObservation: () => void,
  previewMode: boolean,
  previewIndex: number,
  setPreviewIndex: (index: number) => void,
  setPreviewMode: (mode: boolean) => void
): PanelConfiguration => {
  return {
    id: "bottom-panel",
    name: "Bottom Panel",
    tabs: [
      {
        id: "controls",
        label: "Controls",
        settings: [
          {
            id: "view-modes",
            type: "custom",
            label: "View Modes",
            customComponent: "ViewModeControls",
            customProps: {
              viewMode,
              setViewMode,
            },
          },
          {
            id: "playback-controls",
            type: "custom",
            label: "Playback",
            customComponent: "PlaybackControls",
            customProps: {
              isPlaying,
              togglePlayback,
              nextObservation,
              prevObservation,
              observationPoints,
              previewMode,
              previewIndex,
              setPreviewMode,
              selectObservation,
            },
          },
          {
            id: "observation-points",
            type: "custom",
            label: "Observation Points",
            customComponent: "ObservationPointsList",
            customProps: {
              observationPoints,
              selectedObservation,
              addObservationPoint,
              selectObservation,
              previewMode,
              previewIndex,
              setPreviewIndex,
              setPreviewMode,
            },
          },
        ],
      },
    ],
  };
};

export const createCesiumBottomPanelConfig = (
  viewMode: string,
  setViewMode: (mode: string) => void,
  isPlaying: boolean,
  togglePlayback: () => void,
  observationPoints: any[],
  selectedObservation: any,
  addObservationPoint: () => void,
  selectObservation: (id: number) => void,
  nextObservation: () => void,
  prevObservation: () => void,
  previewMode: boolean,
  previewIndex: number,
  setPreviewIndex: (index: number) => void,
  setPreviewMode: (mode: boolean) => void
): PanelConfiguration => {
  return {
    id: "bottom-panel",
    name: "Bottom Panel",
    tabs: [
      {
        id: "controls",
        label: "Controls",
        settings: [
          {
            id: "view-modes",
            type: "custom",
            label: "View Modes",
            customComponent: "ViewModeControls",
            customProps: {
              viewMode,
              setViewMode,
            },
          },
          {
            id: "playback-controls",
            type: "custom",
            label: "Playback",
            customComponent: "PlaybackControls",
            customProps: {
              isPlaying,
              togglePlayback,
              nextObservation,
              prevObservation,
              observationPoints,
              previewMode,
              previewIndex,
              setPreviewMode,
              selectObservation,
            },
          },
          {
            id: "observation-points",
            type: "custom",
            label: "Observation Points",
            customComponent: "ObservationPointsList",
            customProps: {
              observationPoints,
              selectedObservation,
              addObservationPoint,
              selectObservation,
              previewMode,
              previewIndex,
              setPreviewIndex,
              setPreviewMode,
            },
          },
        ],
      },
    ],
  };
};
