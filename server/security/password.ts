import crypto from 'crypto';

const LEGACY_SALT = 'PLATFORM_SALT_2026';

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): { valid: boolean; needsUpgrade: boolean } {
  if (stored.startsWith('scrypt$')) {
    const [, salt, expectedHex] = stored.split('$');
    if (!salt || !expectedHex) return { valid: false, needsUpgrade: false };
    const actual = crypto.scryptSync(password, salt, 64);
    const expected = Buffer.from(expectedHex, 'hex');
    return { valid: actual.length === expected.length && crypto.timingSafeEqual(actual, expected), needsUpgrade: false };
  }
  const legacy = crypto.createHash('sha256').update(password + LEGACY_SALT).digest('hex');
  const valid = stored.length === legacy.length && crypto.timingSafeEqual(Buffer.from(stored), Buffer.from(legacy));
  return { valid, needsUpgrade: valid };
}
