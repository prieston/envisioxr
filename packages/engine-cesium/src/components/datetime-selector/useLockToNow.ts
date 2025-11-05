import { useEffect, useRef } from "react";
import * as Cesium from "cesium";

interface UseLockToNowOptions {
  locked: boolean;
  cesiumViewer: Cesium.Viewer | null;
  setIsPlaying: (playing: boolean) => void;
}

export function useLockToNow({
  locked,
  cesiumViewer,
  setIsPlaying,
}: UseLockToNowOptions): void {
  const lockToNowIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (lockToNow && cesiumViewer?.clock) {
      const now = new Date();
      const julianDate = Cesium.JulianDate.fromDate(now);
      cesiumViewer.clock.currentTime = julianDate;
      cesiumViewer.clock.shouldAnimate = true;
      cesiumViewer.clock.multiplier = 1;
      setIsPlaying(true);

      lockToNowIntervalRef.current = window.setInterval(() => {
        if (cesiumViewer?.clock) {
          const now = new Date();
          const julianDate = Cesium.JulianDate.fromDate(now);
          cesiumViewer.clock.currentTime = julianDate;
        }
      }, 1000);

      return () => {
        if (lockToNowIntervalRef.current) {
          clearInterval(lockToNowIntervalRef.current);
          lockToNowIntervalRef.current = null;
        }
      };
    } else {
      if (lockToNowIntervalRef.current) {
        clearInterval(lockToNowIntervalRef.current);
        lockToNowIntervalRef.current = null;
      }
    }
  }, [locked, cesiumViewer, setIsPlaying]);
}

