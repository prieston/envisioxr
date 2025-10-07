"use client";

import { useEffect, useRef } from "react";
import { useSceneStore } from "@envisio/core";

/**
 * PlaybackManager handles automatic cycling through observation points
 * when playback is active
 */
const PlaybackManager: React.FC = () => {
  const isPlaying = useSceneStore((state) => state.isPlaying);
  const observationPoints = useSceneStore((state) => state.observationPoints);
  const previewIndex = useSceneStore((state) => state.previewIndex);
  const setPreviewIndex = useSceneStore((state) => state.setPreviewIndex);
  const setPreviewMode = useSceneStore((state) => state.setPreviewMode);
  const nextObservation = useSceneStore((state) => state.nextObservation);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Only start interval if playing and have observation points
    if (isPlaying && observationPoints && observationPoints.length > 0) {
      // Cycle through observation points every 3 seconds
      intervalRef.current = setInterval(() => {
        nextObservation();
      }, 3000);
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, observationPoints, nextObservation]);

  // This component doesn't render anything
  return null;
};

export default PlaybackManager;
