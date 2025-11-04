import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  TextField,
  FormControl,
  IconButton,
  Box,
  Tooltip,
  Select,
  MenuItem,
} from "@mui/material";
import { PlayArrow, Pause, LockClock } from "@mui/icons-material";
import { SettingContainer, SettingLabel } from "@envisio/ui";
import {
  DateTimeContainer,
  StyledSwitch,
  GreenSwitch,
  SwitchContainer,
  SwitchLabel,
  LockToNowContainer,
  LockToNowLabel,
  LockToNowDescription,
  CurrentTimeBox,
  CurrentTimeTitle,
  LiveBadge,
  CurrentTimeText,
  InputSectionTitle,
  JoystickContainer,
  JoystickTitle,
  JoystickStatus,
  JoystickSlider,
  textFieldStyles,
  selectStyles,
  menuItemStyles,
  playButtonStyles,
} from "./CesiumDateTimeSelector.styles";
import { useSceneStore } from "@envisio/core";
import * as Cesium from "cesium";

interface CesiumDateTimeSelectorProps {
  value?: unknown;
  onChange?: (value: unknown) => void;
  disabled?: boolean;
}

const CesiumDateTimeSelector: React.FC<CesiumDateTimeSelectorProps> = ({
  disabled = false,
}) => {
  // Combine all scene store subscriptions into a single selector to reduce subscriptions from 8 to 1
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

  // Destructure for cleaner lookups
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

  // Local state for UI
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentDisplayTime, setCurrentDisplayTime] = useState<string>("");
  const [joystickValue, setJoystickValue] = useState(0);
  const [useLocalTime, setUseLocalTime] = useState(true);
  const [lockToNow, setLockToNow] = useState(false);
  const joystickIntervalRef = useRef<number | null>(null);
  const lockToNowIntervalRef = useRef<number | null>(null);

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

  // Update current time display from Cesium clock
  useEffect(() => {
    if (!cesiumViewer?.clock) return;

    const updateDisplay = () => {
      const julianDate = cesiumViewer.clock.currentTime;
      const jsDate = Cesium.JulianDate.toDate(julianDate);

      let timeStr: string;
      let dateStr: string;

      if (useLocalTime) {
        // Local time - use local methods
        const hours = String(jsDate.getHours()).padStart(2, "0");
        const minutes = String(jsDate.getMinutes()).padStart(2, "0");
        const seconds = String(jsDate.getSeconds()).padStart(2, "0");
        timeStr = `${hours}:${minutes}:${seconds}`;

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
        const year = jsDate.getFullYear();
        const month = monthNames[jsDate.getMonth()];
        const day = jsDate.getDate();
        dateStr = `${month} ${day}, ${year}`;
      } else {
        // UTC time - use UTC methods
        const utcHours = String(jsDate.getUTCHours()).padStart(2, "0");
        const utcMinutes = String(jsDate.getUTCMinutes()).padStart(2, "0");
        const utcSeconds = String(jsDate.getUTCSeconds()).padStart(2, "0");
        timeStr = `${utcHours}:${utcMinutes}:${utcSeconds}`;

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

  // Handle lighting toggle
  const handleLightingToggle = useCallback(
    (enabled: boolean) => {
      if (!cesiumViewer) return;

      setCesiumLightingEnabled(enabled);

      if (cesiumViewer.scene) {
        cesiumViewer.scene.sun.show = enabled;
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

  // Handle shadows toggle
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

  // Update Cesium time from inputs
  const updateCesiumTime = useCallback(
    (date: string, time: string) => {
      if (!cesiumViewer || !cesiumInstance) return;

      try {
        let jsDate: Date;

        if (useLocalTime) {
          // Parse as local time
          jsDate = new Date(`${date}T${time}:00`);
        } else {
          // Parse as UTC time
          jsDate = new Date(`${date}T${time}:00Z`);
        }

        const julianDate = Cesium.JulianDate.fromDate(jsDate);

        if (cesiumViewer.clock) {
          cesiumViewer.clock.currentTime = julianDate;
          cesiumViewer.clock.shouldAnimate = false; // Stop animation when manually setting time
          setIsPlaying(false);
        }

        if (cesiumViewer.scene?.requestRender) {
          cesiumViewer.scene.requestRender();
        }
      } catch (error) {
        console.error("Error updating Cesium time:", error);
      }
    },
    [cesiumViewer, cesiumInstance, useLocalTime]
  );

  // Handle play/pause
  const handlePlayPause = useCallback(() => {
    if (!cesiumViewer?.clock) return;

    const newIsPlaying = !isPlaying;
    setIsPlaying(newIsPlaying);
    cesiumViewer.clock.shouldAnimate = newIsPlaying;

    if (newIsPlaying) {
      cesiumViewer.clock.multiplier = 1;
    }
  }, [cesiumViewer, isPlaying]);

  // Handle joystick-style time control
  const handleJoystickChange = useCallback((value: number) => {
    setJoystickValue(value);
  }, []);

  // Effect to handle continuous joystick scrubbing
  useEffect(() => {
    // Clear existing interval
    if (joystickIntervalRef.current) {
      clearInterval(joystickIntervalRef.current);
      joystickIntervalRef.current = null;
    }

    // If at center (0), stop scrubbing
    if (joystickValue === 0) {
      return;
    }

    if (!cesiumViewer?.clock) return;

    // Start interval for continuous time change
    joystickIntervalRef.current = window.setInterval(() => {
      if (!cesiumViewer?.clock) return;

      // Calculate speed based on current joystick position
      // joystickValue ranges from -100 to +100
      // Negative = backward, Positive = forward
      const absValue = Math.abs(joystickValue);
      const direction = joystickValue > 0 ? 1 : -1;

      // Calculate seconds per frame based on joystick position
      // At max (100), we want to move very fast (e.g., 1000 seconds per update)
      // Scale it quadratically for better control at low values
      const normalizedValue = absValue / 100; // 0 to 1
      const speedFactor = normalizedValue * normalizedValue; // Quadratic scaling for smoother control
      const maxSecondsPerFrame = 1000; // Max seconds to add per frame at full deflection
      const secondsPerFrame = speedFactor * maxSecondsPerFrame;

      const currentJulian = cesiumViewer.clock.currentTime;
      // Move time based on joystick position
      const secondsToAdd = secondsPerFrame * direction;
      const newTime = Cesium.JulianDate.addSeconds(
        currentJulian,
        secondsToAdd,
        new Cesium.JulianDate()
      );
      cesiumViewer.clock.currentTime = newTime;

      // Update input fields
      const jsDate = Cesium.JulianDate.toDate(newTime);
      if (useLocalTime) {
        const year = jsDate.getFullYear();
        const month = String(jsDate.getMonth() + 1).padStart(2, "0");
        const day = String(jsDate.getDate()).padStart(2, "0");
        const hours = String(jsDate.getHours()).padStart(2, "0");
        const minutes = String(jsDate.getMinutes()).padStart(2, "0");
        setDateValue(`${year}-${month}-${day}`);
        setTimeValue(`${hours}:${minutes}`);
      } else {
        setDateValue(jsDate.toISOString().split("T")[0]);
        setTimeValue(jsDate.toISOString().substring(11, 16));
      }
    }, 100); // Update 10 times per second

    // Cleanup on unmount or when joystickValue changes
    return () => {
      if (joystickIntervalRef.current) {
        clearInterval(joystickIntervalRef.current);
        joystickIntervalRef.current = null;
      }
    };
  }, [joystickValue, cesiumViewer, useLocalTime]);

  // Handle "Lock to Now" functionality
  useEffect(() => {
    if (lockToNow && cesiumViewer?.clock) {
      // Set to current time immediately
      const now = new Date();
      const julianDate = Cesium.JulianDate.fromDate(now);
      cesiumViewer.clock.currentTime = julianDate;
      cesiumViewer.clock.shouldAnimate = true;
      cesiumViewer.clock.multiplier = 1;
      setIsPlaying(true);

      // Update to real time every second
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
  }, [lockToNow, cesiumViewer]);

  // Cleanup joystick interval on unmount
  useEffect(() => {
    return () => {
      if (joystickIntervalRef.current) {
        clearInterval(joystickIntervalRef.current);
      }
      if (lockToNowIntervalRef.current) {
        clearInterval(lockToNowIntervalRef.current);
      }
    };
  }, []);

  // Track if this is the initial mount
  const isInitialMount = useRef(true);
  const prevUseLocalTime = useRef(useLocalTime);

  useEffect(() => {
    // Don't update Cesium time if only timezone preference changed
    // (this prevents incorrect time interpretation when switching timezones)
    if (prevUseLocalTime.current !== useLocalTime) {
      prevUseLocalTime.current = useLocalTime;
      return;
    }

    if (dateValue && timeValue && !isInitialMount.current) {
      updateCesiumTime(dateValue, timeValue);
      // Save to store as ISO string
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

  return (
    <SettingContainer>
      <SettingLabel>Time Simulation</SettingLabel>

      {/* Enable Lighting Switch */}
      <SwitchContainer
        onClick={() => !disabled && handleLightingToggle(!lightingEnabled)}
      >
        <SwitchLabel>Daytime Lighting</SwitchLabel>
        <StyledSwitch
          checked={lightingEnabled}
          onChange={(e) => handleLightingToggle(e.target.checked)}
          disabled={disabled}
          onClick={(e) => e.stopPropagation()}
        />
      </SwitchContainer>

      {/* Enable Shadows Switch */}
      <SwitchContainer
        onClick={() => !disabled && handleShadowsToggle(!shadowsEnabled)}
      >
        <SwitchLabel>Cast Shadows</SwitchLabel>
        <StyledSwitch
          checked={shadowsEnabled}
          onChange={(e) => handleShadowsToggle(e.target.checked)}
          disabled={disabled}
          onClick={(e) => e.stopPropagation()}
        />
      </SwitchContainer>

      {/* Lock to Now Toggle */}
      <LockToNowContainer
        locked={lockToNow}
        onClick={() => !disabled && setLockToNow(!lockToNow)}
      >
        <Box>
          <LockToNowLabel locked={lockToNow}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <LockClock fontSize="small" />
              Lock to Real Time
            </Box>
          </LockToNowLabel>
          <LockToNowDescription>
            Sync with current date & time
          </LockToNowDescription>
        </Box>
        <GreenSwitch
          checked={lockToNow}
          onChange={(e) => setLockToNow(e.target.checked)}
          disabled={disabled}
          onClick={(e) => e.stopPropagation()}
        />
      </LockToNowContainer>

      {/* Current Time Display */}
      <CurrentTimeBox locked={lockToNow}>
        <CurrentTimeTitle>
          Current Time {useLocalTime ? "(Local)" : "(UTC)"}
          {lockToNow && <LiveBadge>• LIVE</LiveBadge>}
        </CurrentTimeTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            onClick={handlePlayPause}
            disabled={disabled || lockToNow}
            size="small"
            sx={playButtonStyles(lockToNow)}
          >
            {isPlaying ? (
              <Pause fontSize="small" />
            ) : (
              <PlayArrow fontSize="small" />
            )}
          </IconButton>
          <CurrentTimeText locked={lockToNow}>
            {currentDisplayTime || "Loading..."}
          </CurrentTimeText>
        </Box>
      </CurrentTimeBox>

      {/* Date & Time Inputs */}
      <Box sx={{ mb: 1.5 }}>
        <InputSectionTitle>Set Date & Time</InputSectionTitle>
        <DateTimeContainer>
          <FormControl fullWidth size="small">
            <TextField
              type="date"
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
              disabled={disabled || lockToNow}
              size="small"
              sx={textFieldStyles}
            />
          </FormControl>

          <FormControl fullWidth size="small">
            <TextField
              type="time"
              value={timeValue}
              onChange={(e) => setTimeValue(e.target.value)}
              disabled={disabled || lockToNow}
              size="small"
              sx={textFieldStyles}
            />
          </FormControl>
        </DateTimeContainer>

        <FormControl fullWidth size="small" sx={{ mt: 1 }}>
          <Select
            value={useLocalTime ? "local" : "utc"}
            onChange={(e) => setUseLocalTime(e.target.value === "local")}
            disabled={disabled}
            sx={selectStyles}
          >
            <MenuItem value="local" sx={menuItemStyles}>
              Local Time ({Intl.DateTimeFormat().resolvedOptions().timeZone})
            </MenuItem>
            <MenuItem value="utc" sx={menuItemStyles}>
              UTC (Coordinated Universal Time)
            </MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Joystick Time Scrubber */}
      <JoystickContainer>
        <JoystickTitle>Time Scrubber (Joystick)</JoystickTitle>
        <JoystickStatus>
          {joystickValue < 0 && "◀ Rewinding"}
          {joystickValue > 0 && "Fast Forward ▶"}
          {joystickValue === 0 && "Drag to scrub time"}
        </JoystickStatus>
        <Box sx={{ px: 1 }}>
          <Tooltip
            title={
              joystickValue === 0
                ? "Paused"
                : `${Math.abs(
                    Math.round((Math.abs(joystickValue) / 100) ** 2 * 100)
                  )}x speed`
            }
            placement="top"
            arrow
            open={joystickValue !== 0}
          >
            <JoystickSlider
              joystickValue={joystickValue}
              value={joystickValue}
              onChange={(_, value) => handleJoystickChange(value as number)}
              onChangeCommitted={() => {
                // Return to center when released
                setJoystickValue(0);
                handleJoystickChange(0);
              }}
              min={-100}
              max={100}
              step={1}
              marks={[
                { value: -100, label: "◀◀" },
                { value: -50, label: "◀" },
                { value: 0, label: "⏸" },
                { value: 50, label: "▶" },
                { value: 100, label: "▶▶" },
              ]}
              disabled={disabled || lockToNow}
            />
          </Tooltip>
        </Box>
      </JoystickContainer>
    </SettingContainer>
  );
};

export default CesiumDateTimeSelector;
