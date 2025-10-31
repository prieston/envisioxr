import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback, useEffect, useRef } from "react";
import { TextField, FormControl, IconButton, Box, Tooltip, Select, MenuItem, } from "@mui/material";
import { PlayArrow, Pause, LockClock } from "@mui/icons-material";
import { SettingContainer, SettingLabel } from "@envisio/ui";
import { DateTimeContainer, StyledSwitch, GreenSwitch, SwitchContainer, SwitchLabel, LockToNowContainer, LockToNowLabel, LockToNowDescription, CurrentTimeBox, CurrentTimeTitle, LiveBadge, CurrentTimeText, InputSectionTitle, JoystickContainer, JoystickTitle, JoystickStatus, JoystickSlider, textFieldStyles, selectStyles, menuItemStyles, playButtonStyles, } from "./CesiumDateTimeSelector.styles";
import { useSceneStore } from "@envisio/core";
import * as Cesium from "cesium";
const CesiumDateTimeSelector = ({ disabled = false, }) => {
    const cesiumViewer = useSceneStore((state) => state.cesiumViewer);
    const cesiumInstance = useSceneStore((state) => state.cesiumInstance);
    // Get time simulation settings from store
    const lightingEnabled = useSceneStore((state) => state.cesiumLightingEnabled);
    const shadowsEnabled = useSceneStore((state) => state.cesiumShadowsEnabled);
    const setCesiumLightingEnabled = useSceneStore((state) => state.setCesiumLightingEnabled);
    const setCesiumShadowsEnabled = useSceneStore((state) => state.setCesiumShadowsEnabled);
    const setCesiumCurrentTime = useSceneStore((state) => state.setCesiumCurrentTime);
    // Local state for UI
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentDisplayTime, setCurrentDisplayTime] = useState("");
    const [joystickValue, setJoystickValue] = useState(0);
    const [useLocalTime, setUseLocalTime] = useState(true);
    const [lockToNow, setLockToNow] = useState(false);
    const joystickIntervalRef = useRef(null);
    const lockToNowIntervalRef = useRef(null);
    const storedTime = useSceneStore((state) => state.cesiumCurrentTime);
    // Initialize with saved time from store, or current date/time
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
        if (!(cesiumViewer === null || cesiumViewer === void 0 ? void 0 : cesiumViewer.clock))
            return;
        const updateDisplay = () => {
            const julianDate = cesiumViewer.clock.currentTime;
            const jsDate = Cesium.JulianDate.toDate(julianDate);
            let timeStr;
            let dateStr;
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
            }
            else {
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
            setCurrentDisplayTime(`${dateStr} ${timeStr} ${useLocalTime ? "(Local)" : "(UTC)"}`);
        };
        updateDisplay();
        const interval = setInterval(updateDisplay, 100);
        return () => clearInterval(interval);
    }, [cesiumViewer, isPlaying, useLocalTime]);
    // Handle lighting toggle
    const handleLightingToggle = useCallback((enabled) => {
        if (!cesiumViewer)
            return;
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
    }, [cesiumViewer, setCesiumLightingEnabled]);
    // Handle shadows toggle
    const handleShadowsToggle = useCallback((enabled) => {
        var _a;
        if (!cesiumViewer)
            return;
        setCesiumShadowsEnabled(enabled);
        cesiumViewer.shadows = enabled;
        if (cesiumViewer.shadowMap) {
            cesiumViewer.shadowMap.enabled = enabled;
            if (enabled) {
                cesiumViewer.shadowMap.size = 2048;
            }
        }
        if ((_a = cesiumViewer.scene) === null || _a === void 0 ? void 0 : _a.requestRender) {
            cesiumViewer.scene.requestRender();
        }
    }, [cesiumViewer, setCesiumShadowsEnabled]);
    // Update Cesium time from inputs
    const updateCesiumTime = useCallback((date, time) => {
        var _a;
        if (!cesiumViewer || !cesiumInstance)
            return;
        try {
            let jsDate;
            if (useLocalTime) {
                // Parse as local time
                jsDate = new Date(`${date}T${time}:00`);
            }
            else {
                // Parse as UTC time
                jsDate = new Date(`${date}T${time}:00Z`);
            }
            const julianDate = Cesium.JulianDate.fromDate(jsDate);
            if (cesiumViewer.clock) {
                cesiumViewer.clock.currentTime = julianDate;
                cesiumViewer.clock.shouldAnimate = false; // Stop animation when manually setting time
                setIsPlaying(false);
            }
            if ((_a = cesiumViewer.scene) === null || _a === void 0 ? void 0 : _a.requestRender) {
                cesiumViewer.scene.requestRender();
            }
        }
        catch (error) {
            console.error("Error updating Cesium time:", error);
        }
    }, [cesiumViewer, cesiumInstance, useLocalTime]);
    // Handle play/pause
    const handlePlayPause = useCallback(() => {
        if (!(cesiumViewer === null || cesiumViewer === void 0 ? void 0 : cesiumViewer.clock))
            return;
        const newIsPlaying = !isPlaying;
        setIsPlaying(newIsPlaying);
        cesiumViewer.clock.shouldAnimate = newIsPlaying;
        if (newIsPlaying) {
            cesiumViewer.clock.multiplier = 1;
        }
    }, [cesiumViewer, isPlaying]);
    // Handle joystick-style time control
    const handleJoystickChange = useCallback((value) => {
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
        if (!(cesiumViewer === null || cesiumViewer === void 0 ? void 0 : cesiumViewer.clock))
            return;
        // Start interval for continuous time change
        joystickIntervalRef.current = window.setInterval(() => {
            if (!(cesiumViewer === null || cesiumViewer === void 0 ? void 0 : cesiumViewer.clock))
                return;
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
            const newTime = Cesium.JulianDate.addSeconds(currentJulian, secondsToAdd, new Cesium.JulianDate());
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
            }
            else {
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
        if (lockToNow && (cesiumViewer === null || cesiumViewer === void 0 ? void 0 : cesiumViewer.clock)) {
            // Set to current time immediately
            const now = new Date();
            const julianDate = Cesium.JulianDate.fromDate(now);
            cesiumViewer.clock.currentTime = julianDate;
            cesiumViewer.clock.shouldAnimate = true;
            cesiumViewer.clock.multiplier = 1;
            setIsPlaying(true);
            // Update to real time every second
            lockToNowIntervalRef.current = window.setInterval(() => {
                if (cesiumViewer === null || cesiumViewer === void 0 ? void 0 : cesiumViewer.clock) {
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
        }
        else {
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
    return (_jsxs(SettingContainer, { children: [_jsx(SettingLabel, { children: "Time Simulation" }), _jsxs(SwitchContainer, { onClick: () => !disabled && handleLightingToggle(!lightingEnabled), children: [_jsx(SwitchLabel, { children: "Daytime Lighting" }), _jsx(StyledSwitch, { checked: lightingEnabled, onChange: (e) => handleLightingToggle(e.target.checked), disabled: disabled, onClick: (e) => e.stopPropagation() })] }), _jsxs(SwitchContainer, { onClick: () => !disabled && handleShadowsToggle(!shadowsEnabled), children: [_jsx(SwitchLabel, { children: "Cast Shadows" }), _jsx(StyledSwitch, { checked: shadowsEnabled, onChange: (e) => handleShadowsToggle(e.target.checked), disabled: disabled, onClick: (e) => e.stopPropagation() })] }), _jsxs(LockToNowContainer, { locked: lockToNow, onClick: () => !disabled && setLockToNow(!lockToNow), children: [_jsxs(Box, { children: [_jsx(LockToNowLabel, { locked: lockToNow, children: _jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 0.5 }, children: [_jsx(LockClock, { fontSize: "small" }), "Lock to Real Time"] }) }), _jsx(LockToNowDescription, { children: "Sync with current date & time" })] }), _jsx(GreenSwitch, { checked: lockToNow, onChange: (e) => setLockToNow(e.target.checked), disabled: disabled, onClick: (e) => e.stopPropagation() })] }), _jsxs(CurrentTimeBox, { locked: lockToNow, children: [_jsxs(CurrentTimeTitle, { children: ["Current Time ", useLocalTime ? "(Local)" : "(UTC)", lockToNow && _jsx(LiveBadge, { children: "\u2022 LIVE" })] }), _jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [_jsx(IconButton, { onClick: handlePlayPause, disabled: disabled || lockToNow, size: "small", sx: playButtonStyles(lockToNow), children: isPlaying ? (_jsx(Pause, { fontSize: "small" })) : (_jsx(PlayArrow, { fontSize: "small" })) }), _jsx(CurrentTimeText, { locked: lockToNow, children: currentDisplayTime || "Loading..." })] })] }), _jsxs(Box, { sx: { mb: 1.5 }, children: [_jsx(InputSectionTitle, { children: "Set Date & Time" }), _jsxs(DateTimeContainer, { children: [_jsx(FormControl, { fullWidth: true, size: "small", children: _jsx(TextField, { type: "date", value: dateValue, onChange: (e) => setDateValue(e.target.value), disabled: disabled || lockToNow, size: "small", sx: textFieldStyles }) }), _jsx(FormControl, { fullWidth: true, size: "small", children: _jsx(TextField, { type: "time", value: timeValue, onChange: (e) => setTimeValue(e.target.value), disabled: disabled || lockToNow, size: "small", sx: textFieldStyles }) })] }), _jsx(FormControl, { fullWidth: true, size: "small", sx: { mt: 1 }, children: _jsxs(Select, { value: useLocalTime ? "local" : "utc", onChange: (e) => setUseLocalTime(e.target.value === "local"), disabled: disabled, sx: selectStyles, children: [_jsxs(MenuItem, { value: "local", sx: menuItemStyles, children: ["Local Time (", Intl.DateTimeFormat().resolvedOptions().timeZone, ")"] }), _jsx(MenuItem, { value: "utc", sx: menuItemStyles, children: "UTC (Coordinated Universal Time)" })] }) })] }), _jsxs(JoystickContainer, { children: [_jsx(JoystickTitle, { children: "Time Scrubber (Joystick)" }), _jsxs(JoystickStatus, { children: [joystickValue < 0 && "◀ Rewinding", joystickValue > 0 && "Fast Forward ▶", joystickValue === 0 && "Drag to scrub time"] }), _jsx(Box, { sx: { px: 1 }, children: _jsx(Tooltip, { title: joystickValue === 0
                                ? "Paused"
                                : `${Math.abs(Math.round((Math.abs(joystickValue) / 100) ** 2 * 100))}x speed`, placement: "top", arrow: true, open: joystickValue !== 0, children: _jsx(JoystickSlider, { joystickValue: joystickValue, value: joystickValue, onChange: (_, value) => handleJoystickChange(value), onChangeCommitted: () => {
                                    // Return to center when released
                                    setJoystickValue(0);
                                    handleJoystickChange(0);
                                }, min: -100, max: 100, step: 1, marks: [
                                    { value: -100, label: "◀◀" },
                                    { value: -50, label: "◀" },
                                    { value: 0, label: "⏸" },
                                    { value: 50, label: "▶" },
                                    { value: 100, label: "▶▶" },
                                ], disabled: disabled || lockToNow }) }) })] })] }));
};
export default CesiumDateTimeSelector;
