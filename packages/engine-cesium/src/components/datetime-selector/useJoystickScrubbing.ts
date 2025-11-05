import { useEffect, useRef } from "react";
import * as Cesium from "cesium";

interface UseJoystickScrubbingOptions {
  joystickValue: number;
  cesiumViewer: Cesium.Viewer | null;
  useLocalTime: boolean;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
}

export function useJoystickScrubbing({
  joystickValue,
  cesiumViewer,
  useLocalTime,
  onDateChange,
  onTimeChange,
}: UseJoystickScrubbingOptions): void {
  const joystickIntervalRef = useRef<number | null>(null);
  const onDateChangeRef = useRef(onDateChange);
  const onTimeChangeRef = useRef(onTimeChange);
  const useLocalTimeRef = useRef(useLocalTime);
  const wasActiveRef = useRef<boolean>(false);
  const joystickValueRef = useRef(joystickValue);
  const cesiumViewerRef = useRef(cesiumViewer);

  // Keep refs up to date without causing re-renders
  onDateChangeRef.current = onDateChange;
  onTimeChangeRef.current = onTimeChange;
  useLocalTimeRef.current = useLocalTime;
  joystickValueRef.current = joystickValue;
  cesiumViewerRef.current = cesiumViewer;

  useEffect(() => {
    const isNowActive = joystickValue !== 0 && cesiumViewer?.clock !== null;
    const wasActive = wasActiveRef.current;

    // Cleanup previous interval
    if (joystickIntervalRef.current) {
      clearInterval(joystickIntervalRef.current);
      joystickIntervalRef.current = null;
    }

    // When joystick is released (was active, now inactive), update state once
    if (wasActive && !isNowActive && cesiumViewer?.clock) {
      const jsDate = Cesium.JulianDate.toDate(cesiumViewer.clock.currentTime);
      if (useLocalTimeRef.current) {
        const year = jsDate.getFullYear();
        const month = String(jsDate.getMonth() + 1).padStart(2, "0");
        const day = String(jsDate.getDate()).padStart(2, "0");
        const hours = String(jsDate.getHours()).padStart(2, "0");
        const minutes = String(jsDate.getMinutes()).padStart(2, "0");
        onDateChangeRef.current(`${year}-${month}-${day}`);
        onTimeChangeRef.current(`${hours}:${minutes}`);
      } else {
        onDateChangeRef.current(jsDate.toISOString().split("T")[0]);
        onTimeChangeRef.current(jsDate.toISOString().substring(11, 16));
      }
    }

    // Update wasActiveRef for next render
    wasActiveRef.current = isNowActive;

    if (!isNowActive) {
      return;
    }

    // Update Cesium clock directly every 100ms, but don't update React state
    // State will be updated only when joystick is released
    // Use refs to get latest values inside the interval
    joystickIntervalRef.current = window.setInterval(() => {
      const viewer = cesiumViewerRef.current;
      const value = joystickValueRef.current;

      if (!viewer?.clock || value === 0) return;

      const absValue = Math.abs(value);
      const direction = value > 0 ? 1 : -1;
      const normalizedValue = absValue / 100;
      const speedFactor = normalizedValue * normalizedValue;
      const maxSecondsPerFrame = 1000;
      const secondsPerFrame = speedFactor * maxSecondsPerFrame;

      const currentJulian = viewer.clock.currentTime;
      const secondsToAdd = secondsPerFrame * direction;
      const newTime = Cesium.JulianDate.addSeconds(
        currentJulian,
        secondsToAdd,
        new Cesium.JulianDate()
      );
      viewer.clock.currentTime = newTime;
    }, 100);

    return () => {
      if (joystickIntervalRef.current) {
        clearInterval(joystickIntervalRef.current);
        joystickIntervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joystickValue, cesiumViewer]);
}
