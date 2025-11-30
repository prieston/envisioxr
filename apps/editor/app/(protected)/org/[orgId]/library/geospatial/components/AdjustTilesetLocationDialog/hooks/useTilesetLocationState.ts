import { useState } from "react";

export interface Location {
  longitude: number;
  latitude: number;
  height: number;
}

export function useTilesetLocationState(initialTransform?: number[]) {
  const [currentTransform, setCurrentTransform] = useState<
    number[] | undefined
  >(initialTransform);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [pendingLocation, setPendingLocation] = useState<Location | null>(
    null
  );
  const [lastConfirmedTransform, setLastConfirmedTransform] = useState<
    number[] | undefined
  >(initialTransform);

  const reset = (transform?: number[]) => {
    setCurrentTransform(transform);
    setCurrentLocation(null);
    setPendingLocation(null);
    setLastConfirmedTransform(transform);
  };

  return {
    currentTransform,
    setCurrentTransform,
    currentLocation,
    setCurrentLocation,
    pendingLocation,
    setPendingLocation,
    lastConfirmedTransform,
    setLastConfirmedTransform,
    reset,
  };
}

