import * as crypto from 'crypto';

/**
 * Generates a cryptographically secure random token in hex format.
 * Defaults to 32 bytes (64 hex characters).
 */
export function generateCryptoToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Computes a SHA-256 hash of a raw string token in hex format.
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Generates a cryptographically secure random password in hex format.
 * Defaults to 24 bytes (48 hex characters).
 */
export function generateSecurePassword(bytes = 24): string {
  return crypto.randomBytes(bytes).toString('hex');
}
