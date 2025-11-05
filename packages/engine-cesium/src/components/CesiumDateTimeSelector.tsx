import React, { useState, useCallback } from "react";
import { SettingContainer, SettingLabel } from "@envisio/ui";
import { useSceneStore } from "@envisio/core";
import { LightingControls } from "./datetime-selector/LightingControls";
import { LockToNowToggle } from "./datetime-selector/LockToNowToggle";
import { CurrentTimeDisplay } from "./datetime-selector/CurrentTimeDisplay";
import { DateTimeInputs } from "./datetime-selector/DateTimeInputs";
import { TimeJoystick } from "./datetime-selector/TimeJoystick";
import { useTimeDisplay } from "./datetime-selector/useTimeDisplay";
import { useJoystickScrubbing } from "./datetime-selector/useJoystickScrubbing";
import { useLockToNow } from "./datetime-selector/useLockToNow";
import { useDateTimeHandlers } from "./datetime-selector/useDateTimeHandlers";
import { useDateTimeSync } from "./datetime-selector/useDateTimeSync";

interface CesiumDateTimeSelectorProps {
  value?: unknown;
  onChange?: (value: unknown) => void;
  disabled?: boolean;
}

const CesiumDateTimeSelector: React.FC<CesiumDateTimeSelectorProps> = ({
  disabled = false,
}) => {
  const sceneState = useSceneStore((state) => ({
    cesiumViewer: state.cesiumViewer,
    cesiumInstance: state.cesiumInstance,
    lightingEnabled: state.cesiumLightingEnabled,
    shadowsEnabled: state.cesiumShadowsEnabled,
    setCesiumLightingEnabled: state.setCesiumLightingEnabled,
    setCesiumShadowsEnabled: state.setCesiumShadowsEnabled,
    setCesiumCurrentTime: state.setCesiumCurrentTime,
    cesiumCurrentTime: state.cesiumCurrentTime,
  }));

  const {
    cesiumViewer,
    cesiumInstance,
    lightingEnabled,
    shadowsEnabled,
    setCesiumLightingEnabled,
    setCesiumShadowsEnabled,
    setCesiumCurrentTime,
    cesiumCurrentTime: storedTime,
  } = sceneState;

  const [isPlaying, setIsPlaying] = useState(false);
  const [joystickValue, setJoystickValue] = useState(0);
  const [useLocalTime, setUseLocalTime] = useState(true);
  const [lockToNow, setLockToNow] = useState(false);

  const [dateValue, setDateValue] = useState(() => {
    const now = storedTime ? new Date(storedTime) : new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });

  const [timeValue, setTimeValue] = useState(() => {
    const now = storedTime ? new Date(storedTime) : new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  });

  const currentDisplayTime = useTimeDisplay({
    cesiumViewer,
    useLocalTime,
    isPlaying,
  });

  const { handleLightingToggle, handleShadowsToggle, updateCesiumTime, handlePlayPause } =
    useDateTimeHandlers({
      cesiumViewer,
      cesiumInstance,
      useLocalTime,
      setCesiumLightingEnabled,
      setCesiumShadowsEnabled,
      setIsPlaying,
      isPlaying,
    });

  useJoystickScrubbing({
    joystickValue,
    cesiumViewer,
    useLocalTime,
    onDateChange: setDateValue,
    onTimeChange: setTimeValue,
  });

  useLockToNow({
    locked: lockToNow,
    cesiumViewer,
    setIsPlaying,
  });

  useDateTimeSync({
    dateValue,
    timeValue,
    useLocalTime,
    updateCesiumTime,
    setCesiumCurrentTime,
    isJoystickActive: joystickValue !== 0,
  });

  const handleJoystickChange = useCallback((value: number) => {
    setJoystickValue(value);
  }, []);

  const handleJoystickCommit = useCallback(() => {
    setJoystickValue(0);
    handleJoystickChange(0);
  }, [handleJoystickChange]);

  return (
    <SettingContainer>
      <SettingLabel>Time Simulation</SettingLabel>

      <LightingControls
        lightingEnabled={lightingEnabled}
        shadowsEnabled={shadowsEnabled}
        disabled={disabled}
        onLightingToggle={handleLightingToggle}
        onShadowsToggle={handleShadowsToggle}
      />

      <LockToNowToggle
        locked={lockToNow}
        disabled={disabled}
        onChange={setLockToNow}
      />

      <CurrentTimeDisplay
        displayTime={currentDisplayTime}
        isPlaying={isPlaying}
        locked={lockToNow}
        useLocalTime={useLocalTime}
        disabled={disabled}
        onPlayPause={handlePlayPause}
      />

      <DateTimeInputs
        dateValue={dateValue}
        timeValue={timeValue}
        useLocalTime={useLocalTime}
        disabled={disabled}
        locked={lockToNow}
        onDateChange={setDateValue}
        onTimeChange={setTimeValue}
        onTimezoneChange={setUseLocalTime}
      />

      <TimeJoystick
        value={joystickValue}
        disabled={disabled}
        locked={lockToNow}
        onChange={handleJoystickChange}
        onCommit={handleJoystickCommit}
      />
    </SettingContainer>
  );
};

export default CesiumDateTimeSelector;
