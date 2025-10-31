import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback } from "react";
import { Tooltip } from "@mui/material";
import { ViewModeSection, ViewModeRow, ViewModeButton, } from "./CesiumViewModeControls.styles";
import { ThreeSixty, Settings, Person, DirectionsCarFilled, FlightTakeoff, Explore, } from "@mui/icons-material";
import { useSceneStore } from "@envisio/core";
import { useCameraControllerManager } from "../CesiumControls/hooks/useCameraControllerManager";
import { createLogger } from "../utils/logger";
const logger = createLogger("CesiumViewModeControls");
import { exitPointerLockIfActive, requestPointerLockForCanvas, } from "../utils/cesiumPointerLock";
/**
 * CesiumViewModeControls - A comprehensive control system for Cesium 3D navigation
 *
 * Features:
 * - Orbit: Standard Cesium camera controls
 * - Explore: Free camera exploration
 * - Walk: First-person walking with mouse look and physics
 * - Drive: Vehicle simulation with realistic steering
 * - Fly: 3D aerial navigation with 6DOF movement
 * - Settings: Configuration mode
 */
const CesiumViewModeControls = ({ viewMode = "orbit", setViewMode, disabled = false, }) => {
    const { cesiumViewer } = useSceneStore();
    const { switchToMode, isInitialized } = useCameraControllerManager(cesiumViewer);
    /**
     * Handle view mode change
     */
    const handleViewModeChange = useCallback((mode) => {
        if (disabled || !isInitialized) {
            logger.warn("[CesiumViewModeControls] Controls disabled or not initialized");
            return;
        }
        try {
            // Switch to new mode using the controller manager
            switchToMode(mode);
            // Update parent component state
            setViewMode === null || setViewMode === void 0 ? void 0 : setViewMode(mode);
            // Handle pointer lock based on mode
            if ((mode === "firstPerson" || mode === "flight") &&
                (cesiumViewer === null || cesiumViewer === void 0 ? void 0 : cesiumViewer.canvas)) {
                logger.info(`[CesiumViewModeControls] Auto-requesting pointer lock for ${mode} mode`);
                requestPointerLockForCanvas(cesiumViewer.canvas, 100);
            }
            else if (mode !== "firstPerson" &&
                mode !== "flight" &&
                document.pointerLockElement) {
                // Exit pointer lock when switching away from pointer-lock modes
                logger.info("[CesiumViewModeControls] Exiting pointer lock - switching away from pointer-lock mode");
                exitPointerLockIfActive();
            }
            logger.info(`[CesiumViewModeControls] Switched to mode: ${mode}`);
        }
        catch (error) {
            logger.error("[CesiumViewModeControls] Error changing view mode:", error);
        }
    }, [disabled, isInitialized, switchToMode, setViewMode, cesiumViewer]);
    return (_jsxs(ViewModeSection, { previewMode: false, children: [_jsxs(ViewModeRow, { children: [_jsx(Tooltip, { title: "Orbit Controls", children: _jsx(ViewModeButton, { className: viewMode === "orbit" ? "active" : "", onClick: () => handleViewModeChange("orbit"), disabled: disabled || !isInitialized, children: _jsx(ThreeSixty, {}) }) }), _jsx(Tooltip, { title: "Explore Mode", children: _jsx(ViewModeButton, { className: viewMode === "explore" ? "active" : "", onClick: () => handleViewModeChange("explore"), disabled: disabled || !isInitialized, children: _jsx(Explore, {}) }) }), _jsx(Tooltip, { title: "Control Settings", children: _jsx(ViewModeButton, { className: viewMode === "settings" ? "active" : "", onClick: () => handleViewModeChange("settings"), disabled: disabled || !isInitialized, children: _jsx(Settings, {}) }) })] }), _jsxs(ViewModeRow, { children: [_jsx(Tooltip, { title: "First Person (WASD + Mouse)", children: _jsx(ViewModeButton, { className: viewMode === "firstPerson" ? "active" : "", onClick: () => handleViewModeChange("firstPerson"), disabled: disabled || !isInitialized, children: _jsx(Person, {}) }) }), _jsx(Tooltip, { title: "Car Mode (WASD Steering)", children: _jsx(ViewModeButton, { className: viewMode === "car" ? "active" : "", onClick: () => handleViewModeChange("car"), disabled: disabled || !isInitialized, children: _jsx(DirectionsCarFilled, {}) }) }), _jsx(Tooltip, { title: "Drone Flight Mode (WASD + Mouse + Space/Shift)", children: _jsx(ViewModeButton, { className: viewMode === "flight" ? "active" : "", onClick: () => handleViewModeChange("flight"), disabled: disabled || !isInitialized, children: _jsx(FlightTakeoff, {}) }) })] })] }));
};
export default CesiumViewModeControls;
