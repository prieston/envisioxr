import { useCallback } from "react";
import * as Cesium from "cesium";

interface UseDateTimeHandlersOptions {
  cesiumViewer: Cesium.Viewer | null;
  cesiumInstance: any;
  useLocalTime: boolean;
  setCesiumLightingEnabled: (enabled: boolean) => void;
  setCesiumShadowsEnabled: (enabled: boolean) => void;
  setIsPlaying: (playing: boolean) => void;
  isPlaying: boolean;
}

export function useDateTimeHandlers({
  cesiumViewer,
  cesiumInstance,
  useLocalTime,
  setCesiumLightingEnabled,
  setCesiumShadowsEnabled,
  setIsPlaying,
  isPlaying,
}: UseDateTimeHandlersOptions) {
  const handleLightingToggle = useCallback(
    (enabled: boolean) => {
      if (!cesiumViewer) return;

      setCesiumLightingEnabled(enabled);

      if (cesiumViewer.scene) {
        cesiumViewer.scene.sun!.show = enabled;
        cesiumViewer.scene.globe.enableLighting = enabled;
        if (cesiumViewer.scene.skyAtmosphere) {
          cesiumViewer.scene.skyAtmosphere.show = enabled;
        }
        if (cesiumViewer.scene.requestRender) {
          cesiumViewer.scene.requestRender();
        }
      }
    },
    [cesiumViewer, setCesiumLightingEnabled]
  );

  const handleShadowsToggle = useCallback(
    (enabled: boolean) => {
      if (!cesiumViewer) return;

      setCesiumShadowsEnabled(enabled);
      cesiumViewer.shadows = enabled;

      if (cesiumViewer.shadowMap) {
        cesiumViewer.shadowMap.enabled = enabled;
        if (enabled) {
          cesiumViewer.shadowMap.size = 2048;
        }
      }

      if (cesiumViewer.scene?.requestRender) {
        cesiumViewer.scene.requestRender();
      }
    },
    [cesiumViewer, setCesiumShadowsEnabled]
  );

  const updateCesiumTime = useCallback(
    (date: string, time: string) => {
      if (!cesiumViewer || !cesiumInstance) return;

      try {
        let jsDate: Date;

        if (useLocalTime) {
          jsDate = new Date(`${date}T${time}:00`);
        } else {
          jsDate = new Date(`${date}T${time}:00Z`);
        }

        // Validate date
        if (isNaN(jsDate.getTime())) {
          console.warn("Invalid date/time:", date, time);
          return;
        }

        const julianDate = Cesium.JulianDate.fromDate(jsDate);

        if (cesiumViewer.clock) {
          // Only update if the time actually changed to prevent unnecessary updates
          const currentJulian = cesiumViewer.clock.currentTime;
          const timeDiff = Math.abs(
            Cesium.JulianDate.secondsDifference(julianDate, currentJulian)
          );

          // Only update if difference is more than 1 second to prevent micro-updates
          if (timeDiff > 1) {
            cesiumViewer.clock.currentTime = julianDate;
            // Only stop animation if it's a manual date/time input change, not during joystick scrubbing
            // The joystick scrubbing already handles animation state
            if (!cesiumViewer.clock.shouldAnimate) {
              setIsPlaying(false);
            }
          }
        }

        if (cesiumViewer.scene?.requestRender) {
          cesiumViewer.scene.requestRender();
        }
      } catch (error) {
        console.error("Error updating Cesium time:", error);
      }
    },
    [cesiumViewer, cesiumInstance, useLocalTime, setIsPlaying]
  );

  const handlePlayPause = useCallback(() => {
    if (!cesiumViewer?.clock) return;

    const newIsPlaying = !isPlaying;
    setIsPlaying(newIsPlaying);
    cesiumViewer.clock.shouldAnimate = newIsPlaying;

    if (newIsPlaying) {
      cesiumViewer.clock.multiplier = 1;
    }
  }, [cesiumViewer, isPlaying, setIsPlaying]);

  return {
    handleLightingToggle,
    handleShadowsToggle,
    updateCesiumTime,
    handlePlayPause,
  };
}

