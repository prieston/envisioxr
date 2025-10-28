import React, { useState, memo, useCallback } from "react";
import { Alert, Button, Collapse } from "@mui/material";
import { useSceneStore, useWorldStore } from "@envisio/core";
import { flyToCesiumPosition } from "@envisio/engine-cesium";
import { flyToThreeObject } from "@envisio/engine-three/components";
import { ModelObject } from "../../types";
import { ScrollContainer } from "../components/ScrollContainer";
import ObjectActionsSection from "../../ObjectActionsSection";
import ModelInformationSection from "../../ModelInformationSection";
import ObservationModelSection from "../../ObservationModelSection";
import IoTDevicePropertiesPanel from "../../IoTDevicePropertiesPanel";
import TransformLocationSection from "../../TransformLocationSection";
import { usePropertyChange } from "../hooks/usePropertyChange";
import { useGeographicCoords } from "../hooks/useGeographicCoords";

interface ObjectPropertiesViewProps {
  updateObjectProperty: (id: string, property: string, value: unknown) => void;
}

// Coordinate tuple type: [longitude, latitude, altitude]
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type LonLatAlt = [lon: number, lat: number, alt: number];

// Cesium Ion asset type constants
const ION_TYPES = new Set<string>(["cesium-ion-tileset", "cesiumIonAsset"]);

/**
 * ObjectPropertiesView - Displays and edits properties for 3D models
 * Optimized with React.memo to prevent unnecessary re-renders
 */
export const ObjectPropertiesView: React.FC<ObjectPropertiesViewProps> = memo(
  ({ updateObjectProperty }) => {
    const selectedObject = useSceneStore((s) => s.selectedObject);
    const orbitControlsRef = useSceneStore((s) => s.orbitControlsRef);
    const isCalculatingVisibility = useSceneStore(
      (s) => s.isCalculatingVisibility
    );
    const cesiumViewer = useSceneStore((s) => s.cesiumViewer);
    const cesiumIonAssets = useSceneStore((s) => s.cesiumIonAssets);
    const flyToCesiumIonAsset = useSceneStore((s) => s.flyToCesiumIonAsset);
    const startVisibilityCalculation = useSceneStore(
      (s) => s.startVisibilityCalculation
    );
    const engine = useWorldStore((s) => s.engine);

    const [repositioning, setRepositioning] = useState(false);

    const { handlePropertyChange } = usePropertyChange({
      updateObjectProperty,
    });

    const geographicCoords = useGeographicCoords(selectedObject);

    const isCesiumIonAsset = ION_TYPES.has(selectedObject.type);

    const handleFlyToObject = useCallback(() => {
      // Cesium Ion asset path
      if (isCesiumIonAsset && selectedObject.assetId != null) {
        const target = cesiumIonAssets.find(
          (a) => String(a.assetId) === String(selectedObject.assetId)
        );
        if (target) {
          flyToCesiumIonAsset(target.id);
          return;
        }
        console.warn("Cesium Ion asset not found:", selectedObject.assetId);
        // Fall through to position if available
      }

      if (engine === "cesium") {
        if (!cesiumViewer) {
          console.warn("Cesium viewer not available");
          return;
        }

        // Prefer geographicCoords, fallback to object's position (LonLatAlt tuple)
        // position is [lon, lat, alt]
        const lon = geographicCoords?.longitude ?? selectedObject.position?.[0];
        const lat = geographicCoords?.latitude ?? selectedObject.position?.[1];
        const alt =
          geographicCoords?.altitude ?? selectedObject.position?.[2] ?? 150;

        if ([lon, lat].every(Number.isFinite)) {
          // flyToCesiumPosition expects: (viewer, lon, lat, height)
          flyToCesiumPosition(
            cesiumViewer,
            lon as number,
            lat as number,
            alt as number
          );
        } else {
          console.warn("No valid coordinates to fly to");
        }
        return;
      }

      // Three.js engine
      const obj = useSceneStore
        .getState()
        .objects.find((o) => o.id === selectedObject.id);
      const modelRef = obj?.ref;
      if (modelRef && orbitControlsRef) {
        flyToThreeObject(modelRef, orbitControlsRef);
      } else {
        console.warn("Three.js object/ref not available to fly to");
      }
    }, [
      isCesiumIonAsset,
      selectedObject.assetId,
      selectedObject.id,
      selectedObject.position,
      cesiumIonAssets,
      flyToCesiumIonAsset,
      engine,
      cesiumViewer,
      geographicCoords?.longitude,
      geographicCoords?.latitude,
      geographicCoords?.altitude,
      orbitControlsRef,
    ]);

    const handleReposition = useCallback(() => setRepositioning(true), []);
    const handleCancelReposition = useCallback(
      () => setRepositioning(false),
      []
    );

    const handleCalculateViewshed = useCallback(() => {
      startVisibilityCalculation(selectedObject.id);
    }, [startVisibilityCalculation, selectedObject.id]);

    // Compute if "Fly To" is possible (for future use or passing to ObjectActionsSection)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const canFlyTo =
      (engine === "cesium" &&
        !!cesiumViewer &&
        (Number.isFinite(geographicCoords?.longitude) ||
          Number.isFinite(selectedObject.position?.[0]))) ||
      engine !== "cesium";

    return (
      <ScrollContainer>
        <ObjectActionsSection
          onFlyToObject={handleFlyToObject}
          onReposition={isCesiumIonAsset ? undefined : handleReposition}
          repositioning={repositioning}
        />

        {repositioning && !isCesiumIonAsset && (
          <Alert
            severity="info"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={handleCancelReposition}
              >
                Cancel
              </Button>
            }
            sx={{ mb: 2 }}
          >
            Click anywhere in the scene to reposition the model
          </Alert>
        )}

        <ModelInformationSection object={selectedObject} />

        {/* Only show these sections for regular models, not Cesium Ion assets */}
        {/* Using Collapse to prevent layout shift and maintain scroll position */}
        <Collapse in={!isCesiumIonAsset} timeout={0} unmountOnExit={false}>
          <ObservationModelSection
            object={selectedObject}
            onPropertyChange={handlePropertyChange}
            onCalculateViewshed={handleCalculateViewshed}
            isCalculating={isCalculatingVisibility}
            updateObjectProperty={updateObjectProperty}
          />

          <IoTDevicePropertiesPanel
            selectedObject={selectedObject}
            onPropertyChange={handlePropertyChange}
            geographicCoords={geographicCoords}
          />

          <TransformLocationSection
            object={selectedObject}
            geographicCoords={geographicCoords}
            onPropertyChange={handlePropertyChange}
            updateObjectProperty={updateObjectProperty}
          />
        </Collapse>
      </ScrollContainer>
    );
  }
);

ObjectPropertiesView.displayName = "ObjectPropertiesView";
