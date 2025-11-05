import { useEffect, useRef } from "react";

interface UseDateTimeSyncOptions {
  dateValue: string;
  timeValue: string;
  useLocalTime: boolean;
  updateCesiumTime: (date: string, time: string) => void;
  setCesiumCurrentTime: (time: string) => void;
}

export function useDateTimeSync({
  dateValue,
  timeValue,
  useLocalTime,
  updateCesiumTime,
  setCesiumCurrentTime,
}: UseDateTimeSyncOptions): void {
  const isInitialMount = useRef(true);
  const prevUseLocalTime = useRef(useLocalTime);
  const updateCesiumTimeRef = useRef(updateCesiumTime);
  const setCesiumCurrentTimeRef = useRef(setCesiumCurrentTime);

  // Keep refs up to date without causing re-renders
  updateCesiumTimeRef.current = updateCesiumTime;
  setCesiumCurrentTimeRef.current = setCesiumCurrentTime;

  useEffect(() => {
    if (prevUseLocalTime.current !== useLocalTime) {
      prevUseLocalTime.current = useLocalTime;
      return;
    }

    if (dateValue && timeValue && !isInitialMount.current) {
      updateCesiumTimeRef.current(dateValue, timeValue);
      const isoString = useLocalTime
        ? new Date(`${dateValue}T${timeValue}:00`).toISOString()
        : new Date(`${dateValue}T${timeValue}:00Z`).toISOString();
      setCesiumCurrentTimeRef.current(isoString);
    }

    isInitialMount.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateValue, timeValue, useLocalTime]);
}

