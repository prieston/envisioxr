/**
 * Default simulation parameters
 */
export const DEFAULT_SIMULATION_PARAMS = {
    walkSpeed: 50, // meters per second
    carSpeed: 100, // meters per second
    flightSpeed: 200, // meters per second
    turnSpeed: 0.02, // radians per frame
    walkHeight: 1.8, // meters above ground for walking
    carHeight: 1.5, // meters above ground for car
    maxSlope: 0.5, // maximum slope angle in radians (about 30 degrees)
    debugMode: process.env.NODE_ENV === "development", // Only enable debug in development
};
/**
 * Mouse sensitivity for first-person controls
 */
export const MOUSE_SENSITIVITY = {
    LOW: 0.0002,
    MEDIUM: 0.0005,
    HIGH: 0.001,
    DEFAULT: 0.0005, // Reduced from 0.002 for better control
};
/**
 * Car steering parameters
 */
export const CAR_STEERING = {
    turnSpeed: 0.03,
    maxTurnAngle: Math.PI / 4, // 45 degrees
};
/**
 * Animation timing
 */
export const ANIMATION_TIMING = {
    frameRate: 60,
    frameTime: 1 / 60, // 0.016 seconds per frame
};
/**
 * Key codes for movement
 */
export const MOVEMENT_KEYS = {
    FORWARD: "KeyW",
    BACKWARD: "KeyS",
    LEFT: "KeyA",
    RIGHT: "KeyD",
    JUMP: "Space",
    CROUCH: "ShiftLeft",
};
/**
 * Key codes for rotation
 */
export const ROTATION_KEYS = {
    LOOK_LEFT: "ArrowLeft",
    LOOK_RIGHT: "ArrowRight",
    LOOK_UP: "ArrowUp",
    LOOK_DOWN: "ArrowDown",
};
/**
 * Simulation modes configuration
 */
export const SIMULATION_MODES = {
    ORBIT: "orbit",
    EXPLORE: "explore",
    FIRST_PERSON: "firstPerson",
    CAR: "car",
    FLIGHT: "flight",
    SETTINGS: "settings",
};
