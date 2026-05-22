import { pbkdf2Sync } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { hashPassword } from './hash-password.util';

describe('hashPassword', () => {
  it('should return an object with salt and hash', () => {
    const result = hashPassword('myPassword123');
    expect(result).toHaveProperty('salt');
    expect(result).toHaveProperty('hash');
  });

  it('should return a 32-character hex salt (16 bytes)', () => {
    const { salt } = hashPassword('myPassword123');
    expect(salt).toMatch(/^[0-9a-f]{32}$/);
  });

  it('should return a 128-character hex hash (64 bytes)', () => {
    const { hash } = hashPassword('myPassword123');
    expect(hash).toMatch(/^[0-9a-f]{128}$/);
  });

  it('should produce different salts for the same password', () => {
    const result1 = hashPassword('samePassword');
    const result2 = hashPassword('samePassword');
    expect(result1.salt).not.toBe(result2.salt);
  });

  it('should produce different hashes for the same password due to different salts', () => {
    const result1 = hashPassword('samePassword');
    const result2 = hashPassword('samePassword');
    expect(result1.hash).not.toBe(result2.hash);
  });

  it('should produce a hash verifiable with the same salt', () => {
    const password = 'testPassword';
    const { salt, hash } = hashPassword(password);
    const verifyHash = pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString(
      'hex'
    );
    expect(hash).toBe(verifyHash);
  });

  it('should produce a different hash for a different password with the same salt', () => {
    const { salt, hash } = hashPassword('password1');
    const differentHash = pbkdf2Sync(
      'password2',
      salt,
      1000,
      64,
      'sha512'
    ).toString('hex');
    expect(hash).not.toBe(differentHash);
  });

  it('should handle empty string password', () => {
    const result = hashPassword('');
    expect(result.salt).toMatch(/^[0-9a-f]{32}$/);
    expect(result.hash).toMatch(/^[0-9a-f]{128}$/);
  });
});
