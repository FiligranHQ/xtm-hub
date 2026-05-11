import { describe, expect, it } from 'vitest';
import { emailRegex } from './regexs';

describe('emailRegex', () => {
  describe('valid emails', () => {
    it.each([
      'user@example.com',
      'admin@filigran.io',
      'first.last@domain.org',
      'user+tag@example.com',
      'user123@test.co',
      'USER@DOMAIN.COM',
      'a@b.cc',
      "user'name@domain.com",
      'user_name@domain.com',
      'user-name@domain.com',
      'user@sub.domain.org',
      'user@sub.sub.domain.org',
    ])('should match valid email: %s', (email) => {
      expect(emailRegex.test(email)).toBe(true);
    });
  });

  describe('invalid emails', () => {
    it.each([
      '',
      'invalid',
      '@domain.com',
      'user@',
      'user@.com',
      '.user@domain.com',
      'user..name@domain.com',
      'user@domain',
      'user @domain.com',
      'user@ domain.com',
      'user@domain .com',
    ])('should not match invalid email: %s', (email) => {
      expect(emailRegex.test(email)).toBe(false);
    });
  });
});
