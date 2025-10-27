/**
 * Ion SDK Sensor Utilities
 *
 * This file re-exports from the modular sensor utilities in ./sensors/
 * for backward compatibility. All logic has been refactored into focused modules.
 *
 * See ./sensors/README.md for architecture details and usage guide.
 *
 * @deprecated Import directly from ./sensors/ for better tree-shaking
 */

// Re-export everything from the modular structure
export * from "./sensors/index";
