import assert from 'node:assert/strict';
import { test } from 'node:test';

import { hashPassword, isHashedPassword, verifyPassword } from './password-hash';

test('hashPassword never stores the password itself', async () => {
  const stored = await hashPassword('correct horse battery staple');
  assert.notEqual(stored, 'correct horse battery staple');
  assert.ok(isHashedPassword(stored));
});

test('hashPassword salts, so hashing the same password twice differs', async () => {
  const a = await hashPassword('same-password');
  const b = await hashPassword('same-password');
  assert.notEqual(a, b);
});

test('verifyPassword accepts the correct password against a hash', async () => {
  const stored = await hashPassword('hunter2');
  assert.equal(await verifyPassword('hunter2', stored), true);
});

test('verifyPassword rejects the wrong password against a hash', async () => {
  const stored = await hashPassword('hunter2');
  assert.equal(await verifyPassword('wrong-guess', stored), false);
});

test('verifyPassword still accepts a legacy plaintext password unchanged', async () => {
  // Links whose password was set before this fix have the raw string in the
  // database. They must keep working until the password is next saved.
  const legacyStored = 'still-plaintext';
  assert.equal(await verifyPassword('still-plaintext', legacyStored), true);
  assert.equal(await verifyPassword('wrong-guess', legacyStored), false);
});

test('isHashedPassword is false for a legacy plaintext value', () => {
  assert.equal(isHashedPassword('some-plain-password'), false);
});

test('a plaintext password that starts with the scrypt prefix is not treated as a hash', async () => {
  const plain = 'scrypt:my-own-password';
  assert.equal(isHashedPassword(plain), false);
  assert.equal(await verifyPassword(plain, plain), true);
  assert.equal(await verifyPassword('other', plain), false);
});
