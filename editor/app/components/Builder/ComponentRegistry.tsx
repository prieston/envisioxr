import React from "react";
import ViewModeControls from "./ViewModeControls";
import PlaybackControls from "./PlaybackControls";
import ObservationPointsList from "./ObservationPointsList";
import SceneObjectsList from "./SceneObjectsList";
import LocationSearchSection from "./LocationSearchSection";
import PropertiesPanel from "./PropertiesPanel";
import AssetLibraryPanel from "./AssetLibraryPanel";
import LogoHeader from "../AppBar/LogoHeader";
import ReportGenerator from "../Report/ReportGenerator";
import BasemapSelector from "../Environment/BasemapSelector";
import ThreeJSLocationSearchSection from "./ThreeJSLocationSearchSection";
import CesiumLocationSearchSection from "./CesiumLocationSearchSection";
import CesiumBasemapSelector from "./CesiumBasemapSelector";
import CesiumSkyboxSelector from "./CesiumSkyboxSelector";
import { CesiumViewModeControls } from "./CesiumControls";
import CesiumCameraSettings from "./CesiumCameraSettings";
import CesiumSimulationInstructions from "./CesiumSimulationInstructions";

export const componentRegistry: Record<string, React.ComponentType<any>> = {
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

export const getComponent = (
  componentName: string
): React.ComponentType<any> | null => {
  return componentRegistry[componentName] || null;
};
