import { useEffect, useRef } from "react";

interface UseDateTimeSyncOptions {
  dateValue: string;
  timeValue: string;
  useLocalTime: boolean;
  updateCesiumTime: (date: string, time: string) => void;
  setCesiumCurrentTime: (time: string) => void;
  isJoystickActive?: boolean; // Prevent sync when joystick is scrubbing
}

export function useDateTimeSync({
  dateValue,
  timeValue,
  useLocalTime,
  updateCesiumTime,
  setCesiumCurrentTime,
  isJoystickActive = false,
}: UseDateTimeSyncOptions): void {
  const isInitialMount = useRef(true);
  const prevUseLocalTime = useRef(useLocalTime);
  const prevDateValue = useRef(dateValue);
  const prevTimeValue = useRef(timeValue);
  const updateCesiumTimeRef = useRef(updateCesiumTime);
  const setCesiumCurrentTimeRef = useRef(setCesiumCurrentTime);

  // Keep refs up to date without causing re-renders
  updateCesiumTimeRef.current = updateCesiumTime;
  setCesiumCurrentTimeRef.current = setCesiumCurrentTime;

  useEffect(() => {
    // Always skip on initial mount to prevent loops
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevDateValue.current = dateValue;
      prevTimeValue.current = timeValue;
      prevUseLocalTime.current = useLocalTime;
      return;
    }

    // Skip sync when joystick is actively scrubbing (it's already updating Cesium directly)
    if (isJoystickActive) {
      return;
    }

    // Skip if only timezone changed (handled separately)
    if (prevUseLocalTime.current !== useLocalTime) {
      prevUseLocalTime.current = useLocalTime;
      return;
    }

    // Only sync if dateValue or timeValue actually changed
    const dateChanged = prevDateValue.current !== dateValue;
    const timeChanged = prevTimeValue.current !== timeValue;

    if (!dateChanged && !timeChanged) {
      return;
    }

    if (dateValue && timeValue) {
      updateCesiumTimeRef.current(dateValue, timeValue);
      const isoString = useLocalTime
        ? new Date(`${dateValue}T${timeValue}:00`).toISOString()
        : new Date(`${dateValue}T${timeValue}:00Z`).toISOString();
      setCesiumCurrentTimeRef.current(isoString);
    }

    // Update previous values
    prevDateValue.current = dateValue;
    prevTimeValue.current = timeValue;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateValue, timeValue, useLocalTime, isJoystickActive]);
}

