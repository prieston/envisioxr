/**
 * Formats a date as a human-readable relative time string (e.g., "2 hours ago", "3 days ago")
 * @param date - The date to format (Date object, ISO string, or null/undefined)
 * @returns A human-readable time string, or empty string if date is invalid
 */
export function formatTimeAgo(
  date: Date | string | null | undefined
): string {
  if (!date) return "";

  const now = new Date();
  const targetDate = typeof date === "string" ? new Date(date) : date;

  // Check if date is valid
  if (isNaN(targetDate.getTime())) {
    return "";
  }

  const diffMs = now.getTime() - targetDate.getTime();

  // Handle future dates
  if (diffMs < 0) {
    return "just now";
  }

  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffMonths / 12);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60)
    return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24)
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  if (diffWeeks < 4)
    return `${diffWeeks} week${diffWeeks > 1 ? "s" : ""} ago`;
  if (diffMonths < 12)
    return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
  return `${diffYears} year${diffYears > 1 ? "s" : ""} ago`;
}




