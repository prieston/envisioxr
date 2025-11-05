/**
 * Throttling configuration for viewshed analysis updates
 *
 * This configuration controls how viewsheds update when they are inactive (not selected).
 * Active (selected) viewsheds always update at full RAF speed for smooth interaction.
 *
 * To disable throttling: set `enabled: false`
 * To change throttle interval: modify `inactiveUpdateIntervalMs`
 */

export interface ViewshedThrottleConfig {
  /**
   * Enable/disable throttling for inactive viewsheds
   * When disabled, all viewsheds update at full RAF speed
   * @default true
   */
  enabled: boolean;

  /**
   * Update interval for inactive viewsheds (in milliseconds)
   * Active viewsheds always update at ~60fps via RAF
   * @default 1000 (1 second)
   */
  inactiveUpdateIntervalMs: number;
}

/**
 * Default throttling configuration
 * Modify these values to change throttling behavior globally
 */
export const DEFAULT_THROTTLE_CONFIG: ViewshedThrottleConfig = {
  enabled: true,
  inactiveUpdateIntervalMs: 1000, // 1 second
};

/**
 * Global throttle configuration instance
 * Can be modified at runtime to change throttling behavior
 */
let throttleConfig: ViewshedThrottleConfig = { ...DEFAULT_THROTTLE_CONFIG };

/**
 * Get the current throttle configuration
 */
export function getThrottleConfig(): ViewshedThrottleConfig {
  return { ...throttleConfig };
}

/**
 * Update the throttle configuration
 * @param updates Partial configuration to merge with existing config
 *
 * @example
 * // Disable throttling
 * updateThrottleConfig({ enabled: false });
 *
 * @example
 * // Change throttle interval to 500ms
 * updateThrottleConfig({ inactiveUpdateIntervalMs: 500 });
 *
 * @example
 * // Reset to defaults
 * updateThrottleConfig(DEFAULT_THROTTLE_CONFIG);
 */
export function updateThrottleConfig(
  updates: Partial<ViewshedThrottleConfig>
): void {
  throttleConfig = { ...throttleConfig, ...updates };
}

/**
 * Reset throttle configuration to defaults
 */
export function resetThrottleConfig(): void {
  throttleConfig = { ...DEFAULT_THROTTLE_CONFIG };
}

