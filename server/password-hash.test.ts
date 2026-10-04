import assert from 'node:assert/strict';
import { test } from 'node:test';

import { hashPassword, isHashedPassword, verifyPassword } from './password-hash';

test('hashPassword never stores the password itself', () => {
  const stored = hashPassword('correct horse battery staple');
  assert.notEqual(stored, 'correct horse battery staple');
  assert.ok(isHashedPassword(stored));
});

test('hashPassword salts, so hashing the same password twice differs', () => {
  const a = hashPassword('same-password');
  const b = hashPassword('same-password');
  assert.notEqual(a, b);
});

test('verifyPassword accepts the correct password against a hash', () => {
  const stored = hashPassword('hunter2');
  assert.equal(verifyPassword('hunter2', stored), true);
});

test('verifyPassword rejects the wrong password against a hash', () => {
  const stored = hashPassword('hunter2');
  assert.equal(verifyPassword('wrong-guess', stored), false);
});

test('verifyPassword still accepts a legacy plaintext password unchanged', () => {
  // Links whose password was set before this fix have the raw string in the
  // database. They must keep working until the password is next saved.
  const legacyStored = 'still-plaintext';
  assert.equal(verifyPassword('still-plaintext', legacyStored), true);
  assert.equal(verifyPassword('wrong-guess', legacyStored), false);
});

test('isHashedPassword is false for a legacy plaintext value', () => {
  assert.equal(isHashedPassword('some-plain-password'), false);
});

test('a plaintext password that starts with the scrypt prefix is not treated as a hash', () => {
  const plain = 'scrypt:my-own-password';
  assert.equal(isHashedPassword(plain), false);
  assert.equal(verifyPassword(plain, plain), true);
  assert.equal(verifyPassword('other', plain), false);
});
