/**
 * Default simulation parameters
 */
export declare const DEFAULT_SIMULATION_PARAMS: {
    readonly walkSpeed: 50;
    readonly carSpeed: 100;
    readonly flightSpeed: 200;
    readonly turnSpeed: 0.02;
    readonly walkHeight: 1.8;
    readonly carHeight: 1.5;
    readonly maxSlope: 0.5;
    readonly debugMode: boolean;
};
/**
 * Mouse sensitivity for first-person controls
 */
export declare const MOUSE_SENSITIVITY: {
    readonly LOW: 0.0002;
    readonly MEDIUM: 0.0005;
    readonly HIGH: 0.001;
    readonly DEFAULT: 0.0005;
};
/**
 * Car steering parameters
 */
export declare const CAR_STEERING: {
    readonly turnSpeed: 0.03;
    readonly maxTurnAngle: number;
};
/**
 * Animation timing
 */
export declare const ANIMATION_TIMING: {
    readonly frameRate: 60;
    readonly frameTime: number;
};
/**
 * Key codes for movement
 */
export declare const MOVEMENT_KEYS: {
    readonly FORWARD: "KeyW";
    readonly BACKWARD: "KeyS";
    readonly LEFT: "KeyA";
    readonly RIGHT: "KeyD";
    readonly JUMP: "Space";
    readonly CROUCH: "ShiftLeft";
};
/**
 * Key codes for rotation
 */
export declare const ROTATION_KEYS: {
    readonly LOOK_LEFT: "ArrowLeft";
    readonly LOOK_RIGHT: "ArrowRight";
    readonly LOOK_UP: "ArrowUp";
    readonly LOOK_DOWN: "ArrowDown";
};
/**
 * Simulation modes configuration
 */
export declare const SIMULATION_MODES: {
    readonly ORBIT: "orbit";
    readonly EXPLORE: "explore";
    readonly FIRST_PERSON: "firstPerson";
    readonly CAR: "car";
    readonly FLIGHT: "flight";
    readonly SETTINGS: "settings";
};
//# sourceMappingURL=constants.d.ts.map