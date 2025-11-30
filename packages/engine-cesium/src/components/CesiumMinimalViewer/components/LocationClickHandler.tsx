import { useRef } from "react";
import { useLocationClick } from "../hooks/useLocationClick";
import type { CesiumModule } from "../types";

interface LocationClickHandlerProps {
  viewer: any | null;
  Cesium: CesiumModule | null;
  tileset: any | null;
  enabled: boolean;
  onLocationClick?: (
    longitude: number,
    latitude: number,
    height: number,
    matrix: number[]
  ) => void;
}

/**
 * Component to manage click interactions for location editing
 */
export function LocationClickHandler({
  viewer,
  Cesium,
  tileset,
  enabled,
  onLocationClick,
}: LocationClickHandlerProps) {
  const tilesetRef = useRef<any>(null);
  tilesetRef.current = tileset;

  useLocationClick({
    viewer,
    Cesium,
    tilesetRef,
    enabled,
    onLocationClick,
  });

  // This component doesn't render anything - it just manages click handlers
  return null;
}

