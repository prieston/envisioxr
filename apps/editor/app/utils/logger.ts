/**
 * Re-export centralized logger from @envisio/core
 * This ensures all packages use the same logger with compile-time flag support
 */
import { createLogger } from "@envisio/core";

export { createLogger, logger, type Logger } from "@envisio/core";

// Convenience export for app-level logging
export const appLogger = createLogger("App");
