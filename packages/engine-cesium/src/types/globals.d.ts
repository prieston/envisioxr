/**
 * Compile-time constants defined via webpack DefinePlugin
 * These are replaced at build time for dead-code elimination
 */
declare const __DEV__: boolean;
declare const __LOG_LEVEL__: 'debug' | 'info' | 'warn' | 'error' | 'silent';
declare const DEBUG_SENSORS: boolean;


