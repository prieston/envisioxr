import React, { memo } from "react";
import { useSceneStore } from "@envisio/core";
import { ModelObject, ObservationPoint } from "../types";
import { ObjectPropertiesView } from "./views/ObjectPropertiesView";
import { ObservationPointView } from "./views/ObservationPointView";
import { CesiumFeatureView } from "./views/CesiumFeatureView";
import { EmptyStateView } from "./views/EmptyStateView";

interface PropertiesPanelProps {
  selectedObject: ModelObject | null;
  selectedObservation: ObservationPoint | null;
  updateObjectProperty: (id: string, property: string, value: unknown) => void;
  updateObservationPoint: (
    id: number,
    update: Partial<ObservationPoint>
  ) => void;
  setCapturingPOV: (val: boolean) => void;
}

/**
 * PropertiesPanel - Main container for displaying and editing properties
 *
 * This component routes to different views based on what's selected:
 * - ObjectPropertiesView: For 3D models
 * - ObservationPointView: For camera observation points
 * - CesiumFeatureView: For IFC/BIM elements
 * - EmptyStateView: When nothing is selected
 *
 * Uses default memo (shallow prop comparison) - child views handle their own memoization
 */
const PropertiesPanel: React.FC<PropertiesPanelProps> = memo(
  ({
    selectedObject,
    selectedObservation,
    updateObjectProperty,
    updateObservationPoint,
    setCapturingPOV,
  }) => {
    const selectedCesiumFeature = useSceneStore((s) => s.selectedCesiumFeature);

    // Priority 1: Cesium Feature (IFC/BIM elements)
    if (selectedCesiumFeature) {
      return (
        <CesiumFeatureView selectedCesiumFeature={selectedCesiumFeature} />
      );
    }

    // Priority 2: Selected Object (3D Models)
    if (selectedObject) {
      return (
        <ObjectPropertiesView
          selectedObject={selectedObject}
          updateObjectProperty={updateObjectProperty}
        />
      );
    }

    // Priority 3: Observation Point
    if (selectedObservation) {
      return (
        <ObservationPointView
          selectedObservation={selectedObservation}
          updateObservationPoint={updateObservationPoint}
          setCapturingPOV={setCapturingPOV}
        />
      );
    }

    // Default: Empty State
    return <EmptyStateView />;
  }
);

PropertiesPanel.displayName = "PropertiesPanel";

export default PropertiesPanel;
