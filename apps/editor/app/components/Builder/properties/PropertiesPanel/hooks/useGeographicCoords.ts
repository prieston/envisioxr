import { useMemo } from "react";
import * as THREE from "three";
import { useWorldStore } from "@envisio/core";
import { localToGeographic } from "@envisio/core/utils";
import { ModelObject, GeographicCoords } from "../../types";

/**
 * Hook to calculate geographic coordinates from model position
 */
export const useGeographicCoords = (
  modelObject: ModelObject | null
): GeographicCoords | null => {
  return useMemo<GeographicCoords | null>(() => {
    if (!modelObject?.position) return null;

    const posArray = Array.isArray(modelObject.position)
      ? modelObject.position
      : [0, 0, 0];
    const [x, y, z] = posArray;

    const { engine } = useWorldStore.getState();

    if (engine === "cesium") {
      return {
        longitude: x,
        latitude: y,
        altitude: z,
      };
    } else {
      return localToGeographic(
        new THREE.Vector3(x, y, z),
        new THREE.Vector3(0, 0, 0)
      ) as GeographicCoords;
    }
  }, [modelObject?.position]);
};
