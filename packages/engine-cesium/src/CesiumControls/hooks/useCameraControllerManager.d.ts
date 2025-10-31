import * as Cesium from "cesium";
import { SimulationMode } from "../types";
import { IBaseCameraController, CameraControllerConfig } from "../core/BaseCameraController";
/**
 * Hook for managing camera controllers
 */
export declare const useCameraControllerManager: (cesiumViewer: Cesium.Viewer | null) => {
    switchToMode: (mode: SimulationMode) => void;
    updateControllerConfig: (mode: SimulationMode, config: Partial<CameraControllerConfig>) => void;
    getCurrentController: () => IBaseCameraController | null;
    getController: (mode: SimulationMode) => IBaseCameraController | null;
    isModeActive: (mode: SimulationMode) => boolean;
    updateCesiumViewer: (newViewer: Cesium.Viewer | null) => void;
    isInitialized: boolean;
};
//# sourceMappingURL=useCameraControllerManager.d.ts.map