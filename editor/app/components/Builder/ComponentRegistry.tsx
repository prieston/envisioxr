/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import ViewModeControls from "./controls/ViewModeControls";
import PlaybackControls from "./controls/PlaybackControls";
import ObservationPointsList from "./lists/ObservationPointsList";
import SceneObjectsList from "./lists/SceneObjectsList";
import LocationSearchSection from "./search/LocationSearchSection";
import PropertiesPanel from "./properties/PropertiesPanel";
import AssetLibraryPanel from "./assets/AssetLibraryPanel";
import LogoHeader from "../AppBar/LogoHeader";
import ReportGenerator from "../Report/ReportGenerator";
import BasemapSelector from "../Environment/BasemapSelector";
import ThreeJSLocationSearchSection from "./search/ThreeJSLocationSearchSection";
import {
  CesiumLocationSearchSection,
  CesiumBasemapSelector,
  CesiumSkyboxSelector,
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
  ObservationPointsList: ObservationPointsList,
  SceneObjectsList: SceneObjectsList,
  LocationSearchSection: LocationSearchSection,
  PropertiesPanel: PropertiesPanel,
  AssetLibraryPanel: AssetLibraryPanel,
  LogoHeader: LogoHeader,
  ReportGenerator: ReportGenerator,
  BasemapSelector: BasemapSelector,
  ThreeJSLocationSearchSection: ThreeJSLocationSearchSection,
  CesiumLocationSearchSection: CesiumLocationSearchSection,
  CesiumBasemapSelector: CesiumBasemapSelector,
  CesiumSkyboxSelector: CesiumSkyboxSelector,
  CesiumViewModeControls: CesiumViewModeControls,
  CesiumCameraSettings: CesiumCameraSettings,
  CesiumSimulationInstructions: CesiumSimulationInstructions,
};

export const getComponent = (componentName: string): AnyComponent | null => {
  return componentRegistry[componentName] || null;
};
