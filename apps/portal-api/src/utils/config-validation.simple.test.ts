import { describe, expect, it } from 'vitest';
import { validateDevUser } from './config-validation.util';

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
