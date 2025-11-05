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
  const setIsPlayingRef = useRef(setIsPlaying);

  // Keep setIsPlaying ref up to date without causing re-renders
  setIsPlayingRef.current = setIsPlaying;

  useEffect(() => {
    if (locked && cesiumViewer?.clock) {
      const now = new Date();
      const julianDate = Cesium.JulianDate.fromDate(now);
      cesiumViewer.clock.currentTime = julianDate;
      cesiumViewer.clock.shouldAnimate = true;
      cesiumViewer.clock.multiplier = 1;
      setIsPlayingRef.current(true);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked, cesiumViewer]);
}
