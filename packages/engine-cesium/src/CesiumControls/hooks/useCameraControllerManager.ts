import { useRef, useCallback, useEffect } from "react";
import * as Cesium from "cesium";
import { CameraControllerManager } from "../core/CameraControllerManager";
import { SimulationMode } from "../types";
import {
  IBaseCameraController,
  CameraControllerConfig,
} from "../core/BaseCameraController";

/**
 * Hook for managing camera controllers
 */
export const useCameraControllerManager = (
  cesiumViewer: Cesium.Viewer | null
) => {
  const managerRef = useRef<CameraControllerManager | null>(null);

  // Initialize manager when Cesium viewer is available
  useEffect(() => {
    if (cesiumViewer && !managerRef.current) {
      managerRef.current = new CameraControllerManager(cesiumViewer);
    } else if (!cesiumViewer && managerRef.current) {
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
  const switchToMode = useCallback((mode: SimulationMode) => {
    if (managerRef.current) {
      managerRef.current.switchToMode(mode);
    }
  }, []);

  /**
   * Update controller configuration
   */
  const updateControllerConfig = useCallback(
    (mode: SimulationMode, config: Partial<CameraControllerConfig>) => {
      if (managerRef.current) {
        managerRef.current.updateControllerConfig(mode, config);
      }
    },
    []
  );

  /**
   * Get current controller
   */
  const getCurrentController = useCallback((): IBaseCameraController | null => {
    return managerRef.current?.getCurrentController() || null;
  }, []);

  /**
   * Get controller for specific mode
   */
  const getController = useCallback(
    (mode: SimulationMode): IBaseCameraController | null => {
      return managerRef.current?.getController(mode) || null;
    },
    []
  );

  /**
   * Check if a mode is currently active
   */
  const isModeActive = useCallback((mode: SimulationMode) => {
    return managerRef.current?.isModeActive(mode) || false;
  }, []);

  /**
   * Update Cesium viewer reference
   */
  const updateCesiumViewer = useCallback((newViewer: Cesium.Viewer | null) => {
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
