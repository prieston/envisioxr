/**
 * Re-export centralized logger from @klorad/core
 * This ensures all packages use the same logger with compile-time flag support
 */
import { createLogger } from "@klorad/core";

export { createLogger, logger, type Logger } from "@klorad/core";

// Convenience export for app-level logging
export const appLogger = createLogger("App");
