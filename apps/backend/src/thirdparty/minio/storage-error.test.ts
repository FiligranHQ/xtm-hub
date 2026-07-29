import { describe, expect, it } from 'vitest';
import {
  isObjectNotFoundError,
  StorageUnavailableError,
} from './storage-error';

describe('isObjectNotFoundError', () => {
  it.each([
    { name: 'NoSuchKey', expected: true },
    { name: 'NotFound', expected: true },
    { name: 'NoSuchBucket', expected: false },
    { name: 'AccessDenied', expected: false },
    { name: 'TimeoutError', expected: false },
  ])('returns $expected for a $name error', ({ name, expected }) => {
    const error = Object.assign(new Error('S3 failure'), { name });

    expect(isObjectNotFoundError(error)).toBe(expected);
  });

  it.each([
    { label: 'undefined', value: undefined },
    { label: 'a string', value: 'NoSuchKey' },
  ])('returns false when the value is $label', ({ value }) => {
    expect(isObjectNotFoundError(value)).toBe(false);
  });
});

describe('storage unavailable error', () => {
  it('exposes its own name and keeps the underlying cause', () => {
    const cause = new Error('connect ECONNREFUSED');

    const error = new StorageUnavailableError('Cannot retrieve key', { cause });

    expect(error.name).toBe('StorageUnavailableError');
    expect(error.cause).toBe(cause);
  });
});
