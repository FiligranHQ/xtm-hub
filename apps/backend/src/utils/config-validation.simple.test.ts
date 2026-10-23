import { describe, expect, it } from 'vitest';
import { parseTrustProxy, validateDevUser } from './config-validation.util';

describe('zod Config Validation', () => {
  it('should validate a valid dev user', () => {
    const validUser = {
      email: 'test@example.com',
      password: 'password123',
    };

    const result = validateDevUser(validUser);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject invalid email', () => {
    const invalidUser = {
      email: 'not-an-email',
      password: 'password123',
    };

    const result = validateDevUser(invalidUser);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should reject short password', () => {
    const invalidUser = {
      email: 'test@example.com',
      password: '123',
    };

    const result = validateDevUser(invalidUser);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should validate user with organization', () => {
    const userWithOrg = {
      email: 'test@example.com',
      password: 'password123',
      organization: {
        name: 'Test Org',
        domains: ['example.com'],
      },
    };

    const result = validateDevUser(userWithOrg);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe('parseTrustProxy', () => {
  it.each([
    ['a number', 1, 1],
    ['a numeric string, as node-config returns env vars', '1', 1],
    ['a hop count above one', '2', 2],
    ['0, which disables trust', 0, false],
    ['"0", which disables trust', '0', false],
  ])(
    'should parse the hop count when given %s',
    (_description, value, expected) => {
      // Given
      // value and expected come from the dataset

      // When
      const result = parseTrustProxy(value);

      // Then
      expect(result).toBe(expected);
    }
  );

  it.each([
    ['boolean true', true],
    ['the string "true"', 'true'],
    ['a non-numeric string', 'abc'],
    ['a negative number', -1],
    ['a negative numeric string', '-1'],
    ['a decimal string', '1.5'],
    ['a decimal number', 1.5],
    ['an integer string beyond the safe range', '99999999999999999999'],
    ['a signed numeric string', '+1'],
    ['an exponent string', '1e3'],
    ['a hexadecimal string', '0x1'],
    ['a CIDR', '10.0.0.0/8'],
    ['an IP address', '10.0.0.1'],
    ['an Express keyword', 'loopback'],
    ['an empty string', ''],
    ['a padded number', ' 1'],
    ['null', null],
    ['undefined', undefined],
    ['an array', []],
  ])('should throw when given %s', (_description, value) => {
    // Given
    // value comes from the dataset

    // When
    const parse = () => parseTrustProxy(value);

    // Then
    expect(parse).toThrow(
      'Invalid trust_proxy configuration (TRUST_PROXY): expected a non-negative integer hop count'
    );
  });
});
