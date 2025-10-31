/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  ViewModeControls,
  PlaybackControls,
  BottomPanelControls,
  BasemapSelector,
  ObservationPointsList,
} from "@envisio/ui";
import SceneObjectsListWrapper from "../Builder/lists/SceneObjectsListWrapper";
import PropertiesPanel from "../Builder/properties/PropertiesPanel";
import AssetLibraryPanel from "../Builder/assets/AssetLibraryPanel";
import LogoHeader from "../AppBar/LogoHeader";
import ReportGenerator from "../Report/ReportGenerator";
import BuilderActions from "../AppBar/BuilderActions";
import { ThreeJSLocationSearchSection } from "@envisio/engine-three/components";
import {
  CesiumLocationSearchSection,
  CesiumBasemapSelector,
  CesiumDateTimeSelector,
  CesiumIonAssetsManager,
} from "@envisio/engine-cesium/components";
import {
  CesiumViewModeControls,
  CesiumCameraSettings,
  CesiumSimulationInstructions,
} from "@envisio/engine-cesium/components";

export type AnyComponent = React.ComponentType<any>; // intentionally permissive

export const componentRegistry: Record<string, AnyComponent> = {
  ViewModeControls: ViewModeControls,
  PlaybackControls: PlaybackControls,
  BottomPanelControls: BottomPanelControls,
  ObservationPointsList: ObservationPointsList,
  SceneObjectsList: SceneObjectsListWrapper,
  LocationSearchSection: ThreeJSLocationSearchSection,
  PropertiesPanel: PropertiesPanel,
  AssetLibraryPanel: AssetLibraryPanel,
  LogoHeader: LogoHeader,
  ReportGenerator: ReportGenerator,
  BuilderActions: BuilderActions,
  BasemapSelector: BasemapSelector,
  ThreeJSLocationSearchSection: ThreeJSLocationSearchSection,
  CesiumLocationSearchSection: CesiumLocationSearchSection,
  CesiumBasemapSelector: CesiumBasemapSelector,
  CesiumDateTimeSelector: CesiumDateTimeSelector,
  CesiumIonAssetsManager: CesiumIonAssetsManager,
  CesiumViewModeControls: CesiumViewModeControls,
  CesiumCameraSettings: CesiumCameraSettings,
  CesiumSimulationInstructions: CesiumSimulationInstructions,
};

export const getComponent = (componentName: string): AnyComponent | null => {
  const component = componentRegistry[componentName] || null;
  return component;
};
