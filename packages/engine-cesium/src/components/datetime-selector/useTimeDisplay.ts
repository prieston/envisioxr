import { useEffect, useState } from "react";
import * as Cesium from "cesium";

interface UseTimeDisplayOptions {
  cesiumViewer: Cesium.Viewer | null;
  useLocalTime: boolean;
  isPlaying: boolean;
}

export function useTimeDisplay({
  cesiumViewer,
  useLocalTime,
  isPlaying,
}: UseTimeDisplayOptions): string {
  const [currentDisplayTime, setCurrentDisplayTime] = useState<string>("");

  useEffect(() => {
    if (!cesiumViewer?.clock) return;

    const updateDisplay = () => {
      const julianDate = cesiumViewer.clock.currentTime;
      const jsDate = Cesium.JulianDate.toDate(julianDate);

      let timeStr: string;
      let dateStr: string;

      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      if (useLocalTime) {
        const hours = String(jsDate.getHours()).padStart(2, "0");
        const minutes = String(jsDate.getMinutes()).padStart(2, "0");
        const seconds = String(jsDate.getSeconds()).padStart(2, "0");
        timeStr = `${hours}:${minutes}:${seconds}`;

        const year = jsDate.getFullYear();
        const month = monthNames[jsDate.getMonth()];
        const day = jsDate.getDate();
        dateStr = `${month} ${day}, ${year}`;
      } else {
        const utcHours = String(jsDate.getUTCHours()).padStart(2, "0");
        const utcMinutes = String(jsDate.getUTCMinutes()).padStart(2, "0");
        const utcSeconds = String(jsDate.getUTCSeconds()).padStart(2, "0");
        timeStr = `${utcHours}:${utcMinutes}:${utcSeconds}`;

        const utcYear = jsDate.getUTCFullYear();
        const utcMonth = monthNames[jsDate.getUTCMonth()];
        const utcDay = jsDate.getUTCDate();
        dateStr = `${utcMonth} ${utcDay}, ${utcYear}`;
      }

      setCurrentDisplayTime(
        `${dateStr} ${timeStr} ${useLocalTime ? "(Local)" : "(UTC)"}`
      );
    };

    updateDisplay();
    const interval = setInterval(updateDisplay, 100);
    return () => clearInterval(interval);
  }, [cesiumViewer, isPlaying, useLocalTime]);

  return currentDisplayTime;
}

