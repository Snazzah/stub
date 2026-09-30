import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const SCRYPT_KEYLEN = 64;
const SALT_BYTES = 16;
const HASH_PREFIX = 'scrypt:';

/**
 * Link passwords used to be written to the database (and compared with `===`)
 * as plain strings, so a database dump, backup, or query log exposed every
 * link password directly. `hashPassword`/`verifyPassword` store a salted
 * scrypt hash instead. `isHashedPassword` distinguishes the new format from a
 * password saved before this fix, so existing links keep working until their
 * password is next set (which upgrades them to the hashed format).
 */
export function isHashedPassword(value: string): boolean {
  return value.startsWith(HASH_PREFIX);
}

export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_BYTES).toString('hex');
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN).toString('hex');
  return `${HASH_PREFIX}${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  if (!isHashedPassword(stored)) return timingSafeStringsEqual(password, stored);

  const [salt, hashHex] = stored.slice(HASH_PREFIX.length).split(':');
  if (!salt || !hashHex) return false;

  const expected = Buffer.from(hashHex, 'hex');
  const actual = scryptSync(password, salt, SCRYPT_KEYLEN);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/**
 * Legacy (pre-hash) plaintext passwords still need a comparison that isn't
 * length- or content-dependent in its timing. `timingSafeEqual` throws on a
 * buffer-length mismatch, so a differently-sized guess is compared against
 * itself instead of skipped, keeping the running time uniform either way.
 */
function timingSafeStringsEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}
