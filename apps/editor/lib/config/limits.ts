import { isGodUser } from "./godusers";

/**
 * Check if a user has unlimited access (god user)
 * This can be used to bypass limit checks throughout the app
 */
export function hasUnlimitedAccess(userEmail: string | null | undefined): boolean {
  return isGodUser(userEmail);
}

/**
 * Get effective limit for a user
 * Returns null (unlimited) for god users, otherwise returns the actual limit
 */
export function getEffectiveLimit<T>(
  userEmail: string | null | undefined,
  actualLimit: T | null
): T | null {
  if (hasUnlimitedAccess(userEmail)) {
    return null; // Unlimited for god users
  }
  return actualLimit;
}

/**
 * Check if usage exceeds limit
 * Always returns false for god users (they have unlimited access)
 */
export function exceedsLimit(
  userEmail: string | null | undefined,
  usage: number,
  limit: number | null
): boolean {
  if (hasUnlimitedAccess(userEmail)) {
    return false; // Never exceeds for god users
  }
  if (limit === null) {
    return false; // Unlimited limit
  }
  return usage > limit;
}


