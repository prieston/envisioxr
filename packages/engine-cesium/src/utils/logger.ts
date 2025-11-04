/**
 * Re-export centralized logger from @envisio/core
 * This ensures all packages use the same logger with compile-time flag support
 */
export { createLogger, logger, type Logger } from "@envisio/core";
