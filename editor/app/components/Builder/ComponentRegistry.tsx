import React from "react";
import ViewModeControls from "./ViewModeControls";
import PlaybackControls from "./PlaybackControls";
import ObservationPointsList from "./ObservationPointsList";
import SceneObjectsList from "./SceneObjectsList";
import LocationSearchSection from "./LocationSearchSection";
import PropertiesPanel from "./PropertiesPanel";
import AssetLibraryPanel from "./AssetLibraryPanel";

export const componentRegistry: Record<string, React.ComponentType<any>> = {
  ViewModeControls: ViewModeControls,
  PlaybackControls: PlaybackControls,
  ObservationPointsList: ObservationPointsList,
  SceneObjectsList: SceneObjectsList,
  LocationSearchSection: LocationSearchSection,
  PropertiesPanel: PropertiesPanel,
  AssetLibraryPanel: AssetLibraryPanel,
};

export const getComponent = (
  componentName: string
): React.ComponentType<any> | null => {
  return componentRegistry[componentName] || null;
};
