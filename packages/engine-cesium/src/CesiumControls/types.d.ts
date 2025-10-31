import * as Cesium from "cesium";
/**
 * Simulation mode types
 */
export type SimulationMode = "orbit" | "explore" | "firstPerson" | "car" | "flight" | "settings";
/**
 * Movement vector for 3D movement calculations
 */
export interface MovementVector {
    x: number;
    y: number;
    z: number;
}
/**
 * Simulation parameters configuration
 */
export interface SimulationParams {
    walkSpeed: number;
    carSpeed: number;
    flightSpeed: number;
    turnSpeed: number;
    walkHeight: number;
    carHeight: number;
    maxSlope: number;
    debugMode: boolean;
}
/**
 * Props for the CesiumViewModeControls component
 */
export interface CesiumViewModeControlsProps {
    value?: any;
    onChange?: (value: any) => void;
    onClick?: () => void;
    disabled?: boolean;
    viewMode?: SimulationMode;
    setViewMode?: (mode: SimulationMode) => void;
}
/**
 * Ground detection result
 */
export interface GroundDetectionResult {
    height: number;
    isValid: boolean;
    slope?: number;
}
/**
 * Car simulation state
 */
export interface CarSimulationState {
    direction: Cesium.Cartesian3;
    rotation: number;
    isMoving: boolean;
}
//# sourceMappingURL=types.d.ts.map