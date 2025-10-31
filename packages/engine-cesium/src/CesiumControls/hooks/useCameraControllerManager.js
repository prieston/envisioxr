import { useRef, useCallback, useEffect } from "react";
import { CameraControllerManager } from "../core/CameraControllerManager";
/**
 * Hook for managing camera controllers
 */
export const useCameraControllerManager = (cesiumViewer) => {
    const managerRef = useRef(null);
    // Initialize manager when Cesium viewer is available
    useEffect(() => {
        if (cesiumViewer && !managerRef.current) {
            managerRef.current = new CameraControllerManager(cesiumViewer);
        }
        else if (!cesiumViewer && managerRef.current) {
            managerRef.current.dispose();
            managerRef.current = null;
        }
        return () => {
            if (managerRef.current) {
                managerRef.current.dispose();
                managerRef.current = null;
            }
        };
    }, [cesiumViewer]);
    /**
     * Switch to a different simulation mode
     */
    const switchToMode = useCallback((mode) => {
        if (managerRef.current) {
            managerRef.current.switchToMode(mode);
        }
    }, []);
    /**
     * Update controller configuration
     */
    const updateControllerConfig = useCallback((mode, config) => {
        if (managerRef.current) {
            managerRef.current.updateControllerConfig(mode, config);
        }
    }, []);
    /**
     * Get current controller
     */
    const getCurrentController = useCallback(() => {
        var _a;
        return ((_a = managerRef.current) === null || _a === void 0 ? void 0 : _a.getCurrentController()) || null;
    }, []);
    /**
     * Get controller for specific mode
     */
    const getController = useCallback((mode) => {
        var _a;
        return ((_a = managerRef.current) === null || _a === void 0 ? void 0 : _a.getController(mode)) || null;
    }, []);
    /**
     * Check if a mode is currently active
     */
    const isModeActive = useCallback((mode) => {
        var _a;
        return ((_a = managerRef.current) === null || _a === void 0 ? void 0 : _a.isModeActive(mode)) || false;
    }, []);
    /**
     * Update Cesium viewer reference
     */
    const updateCesiumViewer = useCallback((newViewer) => {
        if (managerRef.current) {
            managerRef.current.updateCesiumViewer(newViewer);
        }
    }, []);
    return {
        switchToMode,
        updateControllerConfig,
        getCurrentController,
        getController,
        isModeActive,
        updateCesiumViewer,
        isInitialized: !!managerRef.current,
    };
};
