import { TopBarConfiguration } from "../types/topBarConfig";
import {
  createThreeJSTopBarConfig,
  createCesiumTopBarConfig,
} from "../top-bar/topBarConfig";
import { getEngine } from "../utils/worldStore";

export const getTopBarConfig = (
  selectedObject: any,
  transformMode: "translate" | "rotate" | "scale",
  onTransformModeChange: (mode: "translate" | "rotate" | "scale") => void,
  onSave?: () => Promise<void>,
  onPublish?: () => void,
  previewMode: boolean = false,
  worldStoreState?: any
): TopBarConfiguration => {
  const engine = getEngine(worldStoreState);

  switch (engine) {
    case "three":
      return createThreeJSTopBarConfig(
        selectedObject,
        transformMode,
        onTransformModeChange,
        onSave,
        onPublish,
        previewMode
      );
    case "cesium":
      return createCesiumTopBarConfig(
        selectedObject,
        transformMode,
        onTransformModeChange,
        onSave,
        onPublish,
        previewMode
      );
    default:
      return createThreeJSTopBarConfig(
        selectedObject,
        transformMode,
        onTransformModeChange,
        onSave,
        onPublish,
        previewMode
      ); // Default to ThreeJS
  }
};
