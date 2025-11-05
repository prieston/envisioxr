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

  // Keep refs up to date without causing re-renders
  onDateChangeRef.current = onDateChange;
  onTimeChangeRef.current = onTimeChange;
  useLocalTimeRef.current = useLocalTime;

  useEffect(() => {
    if (joystickIntervalRef.current) {
      clearInterval(joystickIntervalRef.current);
      joystickIntervalRef.current = null;
    }

    if (joystickValue === 0 || !cesiumViewer?.clock) {
      return;
    }

    joystickIntervalRef.current = window.setInterval(() => {
      if (!cesiumViewer?.clock) return;

      const absValue = Math.abs(joystickValue);
      const direction = joystickValue > 0 ? 1 : -1;
      const normalizedValue = absValue / 100;
      const speedFactor = normalizedValue * normalizedValue;
      const maxSecondsPerFrame = 1000;
      const secondsPerFrame = speedFactor * maxSecondsPerFrame;

      const currentJulian = cesiumViewer.clock.currentTime;
      const secondsToAdd = secondsPerFrame * direction;
      const newTime = Cesium.JulianDate.addSeconds(
        currentJulian,
        secondsToAdd,
        new Cesium.JulianDate()
      );
      cesiumViewer.clock.currentTime = newTime;

      const jsDate = Cesium.JulianDate.toDate(newTime);
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
