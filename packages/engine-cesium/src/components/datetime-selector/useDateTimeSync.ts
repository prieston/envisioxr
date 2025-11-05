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

  useEffect(() => {
    if (prevUseLocalTime.current !== useLocalTime) {
      prevUseLocalTime.current = useLocalTime;
      return;
    }

    if (dateValue && timeValue && !isInitialMount.current) {
      updateCesiumTime(dateValue, timeValue);
      const isoString = useLocalTime
        ? new Date(`${dateValue}T${timeValue}:00`).toISOString()
        : new Date(`${dateValue}T${timeValue}:00Z`).toISOString();
      setCesiumCurrentTime(isoString);
    }

    isInitialMount.current = false;
  }, [
    dateValue,
    timeValue,
    updateCesiumTime,
    useLocalTime,
    setCesiumCurrentTime,
  ]);
}

