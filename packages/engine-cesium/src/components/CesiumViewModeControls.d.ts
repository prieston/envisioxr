import React from "react";
import { SimulationMode } from "../CesiumControls/types";
interface CesiumViewModeControlsProps {
    viewMode?: SimulationMode;
    setViewMode?: (mode: SimulationMode) => void;
    disabled?: boolean;
}
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
declare const CesiumViewModeControls: React.FC<CesiumViewModeControlsProps>;
export default CesiumViewModeControls;
//# sourceMappingURL=CesiumViewModeControls.d.ts.map