import { TopBarConfiguration } from "../types/topBarConfig";
import {
  createThreeJSTopBarConfig,
  createCesiumTopBarConfig,
} from "./topBarConfig";
import useWorldStore from "../hooks/useWorldStore";

export const getTopBarConfig = (
  selectedObject: any,
  transformMode: "translate" | "rotate" | "scale",
  onTransformModeChange: (mode: "translate" | "rotate" | "scale") => void,
  onSave?: () => Promise<void>,
  onPublish?: () => void,
  previewMode: boolean = false
): TopBarConfiguration => {
  const engine = useWorldStore.getState().engine;

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
