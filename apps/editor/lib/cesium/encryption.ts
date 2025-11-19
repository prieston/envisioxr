/**
 * Encryption utilities for Cesium Ion tokens
 * Uses AES-256-GCM for authenticated encryption
 */

import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16; // 16 bytes for AES

/**
 * Get encryption key from environment variable
 * Falls back to SECRET if CESIUM_TOKEN_ENCRYPTION_KEY is not set
 */
function getEncryptionKey(): Buffer {
  const keyString =
    process.env.CESIUM_TOKEN_ENCRYPTION_KEY || process.env.SECRET;
  if (!keyString) {
    throw new Error(
      "CESIUM_TOKEN_ENCRYPTION_KEY or SECRET environment variable is required"
    );
  }

  // Derive a 32-byte key from the secret using SHA-256
  return crypto.createHash("sha256").update(keyString).digest();
}

/**
 * Encrypt a token
 * @param plaintext - The token to encrypt
 * @returns Encrypted token as hex string
 */
export function encryptToken(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");

  const tag = cipher.getAuthTag();

  // Return: iv:tag:encrypted (all hex)
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted}`;
}

/**
 * Decrypt a token
 * @param ciphertext - The encrypted token (format: iv:tag:encrypted)
 * @returns Decrypted token
 */
export function decryptToken(ciphertext: string): string {
  const key = getEncryptionKey();
  const parts = ciphertext.split(":");

  if (parts.length !== 3) {
    throw new Error("Invalid encrypted token format");
  }

  const [ivHex, tagHex, encryptedHex] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const encrypted = encryptedHex;

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Get last 4 characters of a token for display
 */
export function getTokenLast4(token: string): string {
  if (token.length <= 4) {
    return token;
  }
  return token.slice(-4);
}
