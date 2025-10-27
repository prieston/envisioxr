/**
 * Type definitions for Ion SDK sensors
 */

import * as Cesium from "cesium";

export type IonSensor = any;

export type SensorComposite = {
  parts: IonSensor[];
  setPose: (modelMatrix: Cesium.Matrix4) => void;
  setFlags: (opts: {
    show?: boolean;
    showViewshed?: boolean;
    showGeometry?: boolean;
  }) => void;
  setColors: (opts: {
    volume?: Cesium.Color;
    visible?: Cesium.Color;
    occluded?: Cesium.Color;
  }) => void;
  updateFov?: (fullDeg: number) => void;
  destroy?: () => void;
};

export type SensorColors = {
  volume?: Cesium.Color;
  visible?: Cesium.Color;
  occluded?: Cesium.Color;
};

export type SensorFlags = {
  show?: boolean;
  showViewshed?: boolean;
  showGeometry?: boolean;
};
