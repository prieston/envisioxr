import { TransformMode } from "../types/topBarConfig";

export interface SceneControl {
  id: string;
  type: "transform" | "magnet" | "custom";
  enabled: boolean;
  visible: boolean;
  customComponent?: React.ComponentType<any> | string;
  customProps?: Record<string, any>;
}

export interface SceneControlsConfiguration {
  id: string;
  name: string;
  controls: SceneControl[];
}

export const createThreeJSSceneControlsConfig = (
  selectedObject: any,
  transformMode: TransformMode,
  magnetEnabled: boolean = false
): SceneControlsConfiguration => {
  return {
    id: "scene-controls",
    name: "Scene Controls",
    controls: [
      {
        id: "transform-controls",
        type: "transform",
        enabled: !!selectedObject,
        visible: !!selectedObject,
      },
      {
        id: "magnet-controls",
        type: "magnet",
        enabled: magnetEnabled && !!selectedObject,
        visible: !!selectedObject,
      },
    ],
  };
};

export const createCesiumSceneControlsConfig = (
  selectedObject: any,
  transformMode: TransformMode,
  magnetEnabled: boolean = false
): SceneControlsConfiguration => {
  return {
    id: "scene-controls",
    name: "Scene Controls",
    controls: [
      // For Cesium, we might have different controls or none at all
      // This can be customized later for Cesium-specific behavior
    ],
  };
};
