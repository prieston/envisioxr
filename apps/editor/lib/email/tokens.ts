/**
 * Token generation and validation utilities
 * Provides secure token generation for email verification, password reset, and invitations
 */

import { randomBytes } from "crypto";

/**
 * Generate a secure random token
 * Uses crypto.randomBytes for cryptographically secure randomness
 *
 * @param length - Length of the token in bytes (default: 32)
 * @returns Hex-encoded token string
 */
export function generateToken(length: number = 32): string {
  return randomBytes(length).toString("hex");
}

/**
 * Generate a numeric reset code
 * Creates a 6-digit code for password reset
 *
 * @returns 6-digit numeric code as string
 */
export function generateResetCode(): string {
  // Generate a random number between 100000 and 999999
  const min = 100000;
  const max = 999999;
  const code = Math.floor(Math.random() * (max - min + 1)) + min;
  return code.toString();
}

/**
 * Calculate expiration date for a token
 *
 * @param hours - Number of hours until expiration (default: 24)
 * @returns Date object representing expiration time
 */
export function getTokenExpiration(hours: number = 24): Date {
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + hours);
  return expiration;
}

