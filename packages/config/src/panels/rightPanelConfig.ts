import { Settings } from "@mui/icons-material";
import { PanelConfiguration } from "../types/panelConfig";

export const createThreeJSRightPanelConfig = (
  selectedObject: any,
  selectedObservation: any,
  viewMode: string,
  controlSettings: any,
  updateObjectProperty: (id: string, property: string, value: any) => void,
  updateObservationPoint: (id: number, update: any) => void,
  deleteObservationPoint: (id: number) => void,
  setCapturingPOV: (val: boolean) => void,
  updateControlSettings: (update: any) => void,
  repositioning?: boolean,
  onStartRepositioning?: (objectId: string) => void,
  onCancelRepositioning?: () => void
): PanelConfiguration => {
  return {
    id: "right-panel",
    name: "Right Panel",
    tabs: [
      {
        id: "properties",
        label: "Properties",
        icon: Settings,
        settings: [
          {
            id: "properties-panel",
            type: "custom",
            label: "Properties",
            customComponent: "PropertiesPanel",
            customProps: {
              selectedObject,
              selectedObservation,
              viewMode,
              controlSettings,
              updateObjectProperty,
              updateObservationPoint,
              deleteObservationPoint,
              setCapturingPOV,
              updateControlSettings,
              repositioning,
              onStartRepositioning,
              onCancelRepositioning,
            },
          },
        ],
      },
    ],
  };
};

export const createCesiumRightPanelConfig = (
  selectedObject: any,
  selectedObservation: any,
  viewMode: string,
  controlSettings: any,
  updateObjectProperty: (id: string, property: string, value: any) => void,
  updateObservationPoint: (id: number, update: any) => void,
  deleteObservationPoint: (id: number) => void,
  setCapturingPOV: (val: boolean) => void,
  updateControlSettings: (update: any) => void,
  repositioning?: boolean,
  onStartRepositioning?: (objectId: string) => void,
  onCancelRepositioning?: () => void
): PanelConfiguration => {
  return {
    id: "right-panel",
    name: "Right Panel",
    tabs: [
      {
        id: "properties",
        label: "Properties",
        icon: Settings,
        settings: [
          {
            id: "properties-panel",
            type: "custom",
            label: "Properties",
            customComponent: "PropertiesPanel",
            customProps: {
              selectedObject,
              selectedObservation,
              viewMode,
              controlSettings,
              updateObjectProperty,
              updateObservationPoint,
              deleteObservationPoint,
              setCapturingPOV,
              updateControlSettings,
              repositioning,
              onStartRepositioning,
              onCancelRepositioning,
            },
          },
        ],
      },
    ],
  };
};
