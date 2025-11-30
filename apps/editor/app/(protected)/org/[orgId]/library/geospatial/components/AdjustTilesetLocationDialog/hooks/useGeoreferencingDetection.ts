"use client";

import { useState, useRef, useCallback } from "react";
import { extractTilesetGeoreferencing } from "@klorad/engine-cesium";
import { extractLocationFromTransform, extractHPRFromTransform } from "../utils/transform-utils";
import type { Location } from "../utils/transform-utils";

interface UseGeoreferencingDetectionOptions {
  initialTransform?: number[];
  onLocationDetected: (location: Location) => void;
  onHPRDetected: (hpr: { heading: number; pitch: number; roll: number }) => void;
}

export function useGeoreferencingDetection({
  initialTransform,
  onLocationDetected,
  onHPRDetected,
}: UseGeoreferencingDetectionOptions) {
  const [isGeoreferencedByDefault, setIsGeoreferencedByDefault] =
    useState(false);
  const hasCheckedGeoreferencingRef = useRef(false);
  const foundGeoreferencingRef = useRef(false);

  const reset = useCallback(() => {
    hasCheckedGeoreferencingRef.current = false;
    foundGeoreferencingRef.current = false;
    setIsGeoreferencedByDefault(false);
  }, []);

  const handleTilesetReady = useCallback(
    async (tileset: any) => {
      try {
        const Cesium = await import("cesium");

        // If initialTransform exists, it means georeferencing is from platform metadata - allow editing
        if (initialTransform && initialTransform.length === 16) {
          setIsGeoreferencedByDefault(false);
          hasCheckedGeoreferencingRef.current = true;

          // Extract location and rotation from initial transform
          const location = extractLocationFromTransform(Cesium, initialTransform);
          const hpr = extractHPRFromTransform(Cesium, initialTransform);

          onLocationDetected(location);
          if (onHPRDetected) {
            onHPRDetected(hpr);
          }

          return; // Done - allow editing
        }

        // Only check for Cesium Ion georeferencing if no initialTransform
        if (!hasCheckedGeoreferencingRef.current && !initialTransform) {
          hasCheckedGeoreferencingRef.current = true;

          // Wait a bit for bounding sphere to be calculated (if not already available)
          const checkGeoreferencing = () => {
            const { computedTransform } = extractTilesetGeoreferencing(
              Cesium,
              tileset,
              undefined,
              undefined
            );

            // Only consider it georeferenced by default if transform has valid coordinates
            if (
              computedTransform &&
              computedTransform.longitude !== undefined &&
              computedTransform.latitude !== undefined
            ) {
              foundGeoreferencingRef.current = true;
              setIsGeoreferencedByDefault(true);

              const locationToDisplay: Location = {
                longitude: computedTransform.longitude,
                latitude: computedTransform.latitude,
                height: computedTransform.height || 0,
              };

              onLocationDetected(locationToDisplay);
            }
          };

          // Check immediately first
          checkGeoreferencing();

          // Also check again after a delay in case bounding sphere wasn't ready yet
          setTimeout(() => {
            if (!foundGeoreferencingRef.current) {
              checkGeoreferencing();
            }
          }, 500);
        }
      } catch (err) {
        // Silently handle georeferencing check errors
      }
    },
    [initialTransform, onLocationDetected, onHPRDetected]
  );

  return {
    isGeoreferencedByDefault,
    setIsGeoreferencedByDefault,
    handleTilesetReady,
    reset,
  };
}

