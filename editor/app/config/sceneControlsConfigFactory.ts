import { SceneControlsConfiguration } from "./sceneControlsConfig";
import {
  createThreeJSSceneControlsConfig,
  createCesiumSceneControlsConfig,
} from "./sceneControlsConfig";
import useWorldStore from "../hooks/useWorldStore";
import { TransformMode } from "../types/topBarConfig";

export const getSceneControlsConfig = (
  selectedObject: any,
  transformMode: TransformMode,
  magnetEnabled: boolean = false
): SceneControlsConfiguration => {
  const engine = useWorldStore.getState().engine;

  switch (engine) {
    case "three":
      return createThreeJSSceneControlsConfig(
        selectedObject,
        transformMode,
        magnetEnabled
      );
    case "cesium":
      return createCesiumSceneControlsConfig(selectedObject, transformMode);
    default:
      return createThreeJSSceneControlsConfig(
        selectedObject,
        transformMode,
        magnetEnabled
      ); // Default to ThreeJS
  }
};
