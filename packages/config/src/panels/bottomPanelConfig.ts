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
  deleteObservationPoint: (id: number) => void,
  nextObservation: () => void,
  prevObservation: () => void,
  previewMode: boolean,
  previewIndex: number,
  setPreviewIndex: (index: number) => void,
  setPreviewMode: (mode: boolean) => void
): PanelConfiguration => {
  // Calculate current index for canNext/canPrev
  const currentIndex =
    observationPoints && selectedObservation
      ? observationPoints.findIndex((p: any) => p.id === selectedObservation.id)
      : -1;

  return {
    id: "bottom-panel",
    name: "Bottom Panel",
    tabs: [
      {
        id: "controls",
        label: "Controls",
        settings: [
          {
            id: "bottom-panel-controls",
            type: "custom",
            label: "Controls",
            customComponent: "BottomPanelControls",
            customProps: {
              // Playback props
              isPlaying,
              togglePlayback,
              next: nextObservation,
              prev: prevObservation,
              canNext:
                observationPoints.length > 0 &&
                currentIndex >= 0 &&
                currentIndex < observationPoints.length - 1,
              canPrev: observationPoints.length > 0 && currentIndex > 0,
              // Observation points props
              observationPoints,
              selectedObservation,
              addObservationPoint,
              selectObservation,
              deleteObservationPoint,
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
  deleteObservationPoint: (id: number) => void,
  nextObservation: () => void,
  prevObservation: () => void,
  previewMode: boolean,
  previewIndex: number,
  setPreviewIndex: (index: number) => void,
  setPreviewMode: (mode: boolean) => void
): PanelConfiguration => {
  // Calculate current index for canNext/canPrev
  const currentIndex =
    observationPoints && selectedObservation
      ? observationPoints.findIndex((p: any) => p.id === selectedObservation.id)
      : -1;

  return {
    id: "bottom-panel",
    name: "Bottom Panel",
    tabs: [
      {
        id: "controls",
        label: "Controls",
        settings: [
          {
            id: "bottom-panel-controls",
            type: "custom",
            label: "Controls",
            customComponent: "BottomPanelControls",
            customProps: {
              // Playback props
              isPlaying,
              togglePlayback,
              next: nextObservation,
              prev: prevObservation,
              canNext:
                observationPoints.length > 0 &&
                currentIndex >= 0 &&
                currentIndex < observationPoints.length - 1,
              canPrev: observationPoints.length > 0 && currentIndex > 0,
              // Observation points props
              observationPoints,
              selectedObservation,
              addObservationPoint,
              selectObservation,
              deleteObservationPoint,
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
