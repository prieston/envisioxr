/**
 * God Users Configuration
 *
 * Users listed here have unlimited access and bypass all billing/limits.
 * They can:
 * - Create organizations without payment
 * - Access admin panel
 * - Bypass all plan limits
 */

export const GOD_USERS = [
  "theofilos@prieston.gr",
  // Add more god users here as needed
] as const;

/**
 * Check if a user email is a god user
 */
export function isGodUser(email: string | null | undefined): boolean {
  if (!email) return false;
  return GOD_USERS.includes(email.toLowerCase() as any);
}

/**
 * Get all god user emails (for admin purposes)
 */
export function getGodUsers(): readonly string[] {
  return GOD_USERS;
}

