import { useCallback } from "react";
import { useSceneStore } from "@envisio/core";
import { ModelObject } from "../../types";

interface UsePropertyChangeProps {
  selectedObject: ModelObject | null;
  updateObjectProperty: (id: string, property: string, value: unknown) => void;
}

/**
 * Custom hook to handle property changes with nested property support
 */
export const usePropertyChange = ({
  updateObjectProperty,
}: Omit<UsePropertyChangeProps, "selectedObject">) => {
  const handlePropertyChange = useCallback(
    (property: string, value: number | string | boolean) => {
      // Get the selected object fresh from the store to ensure it's not stale
      const selectedObject = useSceneStore.getState().selectedObject;
      if (!selectedObject) return;

      // Handle nested observation properties - ALWAYS read from store to get fresh state
      if (property.startsWith("observationProperties.")) {
        const propName = property.split(".")[1];

        // Get fresh observationProperties from store to avoid stale prop issues
        const currentObject = useSceneStore
          .getState()
          .objects.find((obj) => obj.id === selectedObject.id);
        const currentObsProps = currentObject?.observationProperties;

        const updatedProperties = {
          // Merge current state from store (source of truth)
          ...currentObsProps,
          // Apply the new value
          [propName]: value,
        };
        updateObjectProperty(
          selectedObject.id,
          "observationProperties",
          updatedProperties
        );
        return;
      }

      // Handle nested IoT properties - ALWAYS read from store to get fresh state
      if (property.startsWith("iotProperties.")) {
        const propName = property.split(".")[1];

        // Get fresh iotProperties from store to avoid stale prop issues
        const currentObject = useSceneStore
          .getState()
          .objects.find((obj) => obj.id === selectedObject.id);
        const currentIotProps = currentObject?.iotProperties;

        const updatedProperties = {
          // Start with minimal safe defaults
          enabled: false,
          serviceType: "weather",
          apiEndpoint: "https://api.open-meteo.com/v1/forecast",
          updateInterval: 2000,
          showInScene: true,
          displayFormat: "compact" as "compact" | "detailed" | "minimal",
          autoRefresh: true,
          // Merge current state from store (this is the source of truth)
          ...currentIotProps,
          // Apply the new value
          [propName]: value,
        };

        updateObjectProperty(
          selectedObject.id,
          "iotProperties",
          updatedProperties
        );
        return;
      }

      // Handle array properties (e.g., position.0, rotation.1)
      if (property.includes(".")) {
        const [parent, child] = property.split(".");
        const index = parseInt(child);
        if (!isNaN(index)) {
          // Get fresh state from store
          const currentObject = useSceneStore
            .getState()
            .objects.find((obj) => obj.id === selectedObject.id);
          const currentArray = Array.isArray(
            currentObject?.[parent as keyof ModelObject]
          )
            ? [...(currentObject[parent as keyof ModelObject] as number[])]
            : [0, 0, 0];
          currentArray[index] = value as number;
          updateObjectProperty(selectedObject.id, parent, currentArray);
          return;
        }
      }

      // Handle simple properties
      updateObjectProperty(selectedObject.id, property, value);
    },
    [updateObjectProperty]
  );

  return { handlePropertyChange };
};
