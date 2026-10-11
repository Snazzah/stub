import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);

const SCRYPT_KEYLEN = 64;
const SALT_BYTES = 16;
const HASH_PREFIX = 'scrypt:';
const HASH_FORMAT = new RegExp(
  `^${HASH_PREFIX}[0-9a-f]{${SALT_BYTES * 2}}:[0-9a-f]{${SCRYPT_KEYLEN * 2}}$`
);

/**
 * Link passwords used to be written to the database (and compared with `===`)
 * as plain strings, so a database dump, backup, or query log exposed every
 * link password directly. `hashPassword`/`verifyPassword` store a salted
 * scrypt hash instead. `isHashedPassword` distinguishes the new format from a
 * password saved before this fix, so existing links keep working until their
 * password is next set (which upgrades them to the hashed format).
 *
 * scrypt runs on the libuv threadpool via the async `scrypt()` API rather
 * than `scryptSync()`, so verifying a password candidate against a
 * password-protected link doesn't block the Node event loop -- a sync call
 * here would let anyone hitting that link with bad guesses stall every other
 * request this process is serving.
 */
export function isHashedPassword(value: string): boolean {
  return HASH_FORMAT.test(value);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES).toString('hex');
  const hash = ((await scryptAsync(password, salt, SCRYPT_KEYLEN)) as Buffer).toString('hex');
  return `${HASH_PREFIX}${salt}:${hash}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (!isHashedPassword(stored)) return timingSafeStringsEqual(password, stored);

  const [salt, hashHex] = stored.slice(HASH_PREFIX.length).split(':');
  if (!salt || !hashHex) return false;

  const expected = Buffer.from(hashHex, 'hex');
  const actual = (await scryptAsync(password, salt, SCRYPT_KEYLEN)) as Buffer;
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
