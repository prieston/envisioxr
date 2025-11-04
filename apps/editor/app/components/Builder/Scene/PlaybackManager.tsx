"use client";

import { useEffect, useRef } from "react";
import { useSceneStore } from "@envisio/core";

/**
 * PlaybackManager handles automatic cycling through observation points
 * when playback is active
 */
const PlaybackManager: React.FC = () => {
  // Combine store subscriptions to reduce from 4 to 1
  const sceneState = useSceneStore((state) => ({
    isPlaying: state.isPlaying,
    observationPoints: state.observationPoints,
    nextObservation: state.nextObservation,
  }));

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Auto-cycling disabled - play button only enables preview mode
    // Users can manually navigate between observation points using next/prev buttons

    // Cleanup on unmount or when dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [sceneState.isPlaying, sceneState.observationPoints, sceneState.nextObservation]);

  // This component doesn't render anything
  return null;
};

export default PlaybackManager;
