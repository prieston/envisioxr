import { PanelConfiguration } from "../types/panelConfig";
import {
  createThreeJSLeftPanelConfig,
  createCesiumLeftPanelConfig,
} from "./leftPanelConfig";
import useWorldStore from "../hooks/useWorldStore";

export const getLeftPanelConfig = (
  gridEnabled: boolean,
  setGridEnabled: (enabled: boolean) => void,
  skyboxType: "default" | "hdri" | "gradient" | "none",
  setSkyboxType: (type: "default" | "hdri" | "gradient" | "none") => void,
  ambientLightIntensity: number,
  setAmbientLightIntensity: (intensity: number) => void
): PanelConfiguration => {
  const engine = useWorldStore.getState().engine;

  switch (engine) {
    case "three":
      return createThreeJSLeftPanelConfig(
        gridEnabled,
        setGridEnabled,
        skyboxType,
        setSkyboxType,
        ambientLightIntensity,
        setAmbientLightIntensity
      );
    case "cesium":
      return createCesiumLeftPanelConfig(
        gridEnabled,
        setGridEnabled,
        skyboxType,
        setSkyboxType,
        ambientLightIntensity,
        setAmbientLightIntensity
      );
    default:
      return createThreeJSLeftPanelConfig(
        gridEnabled,
        setGridEnabled,
        skyboxType,
        setSkyboxType,
        ambientLightIntensity,
        setAmbientLightIntensity
      ); // Default to ThreeJS
  }
};

export const getPanelConfig = (panelId: string): PanelConfiguration => {
  switch (panelId) {
    case "left-panel":
      // This function needs to be updated to accept parameters
      throw new Error(
        "getPanelConfig needs to be updated to accept state parameters"
      );
    // Add other panels here as needed
    default:
      throw new Error(`Unknown panel ID: ${panelId}`);
  }
};
