/**
 * Utility functions for formatting Cesium feature properties
 */

/**
 * Check if a value is empty
 */
export function isEmpty(value: unknown): boolean {
  return value === undefined || value === null || value === "";
}

/**
 * Format property key for display (human-readable)
 */
export function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1") // Add space before capital letters
    .replace(/_/g, " ") // Replace underscores with spaces
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Format property value for display
 */
export function formatValue(value: unknown): string {
  if (value === undefined || value === null) {
    return "—";
  }
  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (typeof value === "number") {
    return value.toLocaleString(undefined, { maximumFractionDigits: 3 });
  }
  return String(value);
}

