import { describe, expect, it } from 'vitest';
import { formatName } from './format';

describe('formatName', () => {
  it.each`
    input                   | expected
    ${'john'}               | ${'John'}
    ${'JOHN'}               | ${'John'}
    ${'jOhN'}               | ${'John'}
    ${'jean-pierre'}        | ${'Jean-Pierre'}
    ${'JEAN-PIERRE'}        | ${'Jean-Pierre'}
    ${'john doe'}           | ${'John Doe'}
    ${'JOHN DOE'}           | ${'John Doe'}
    ${'jOhN dOe'}           | ${'John Doe'}
    ${'jean-pierre dupont'} | ${'Jean-Pierre Dupont'}
    ${'a'}                  | ${'A'}
    ${'A'}                  | ${'A'}
  `('should format "$input" to "$expected"', ({ input, expected }) => {
    expect(formatName(input)).toBe(expected);
  });

  it('should return empty string for null', () => {
    expect(formatName(null)).toBe('');
  });

  it('should return empty string for undefined', () => {
    expect(formatName(undefined)).toBe('');
  });

  it('should return empty string for empty string', () => {
    expect(formatName('')).toBe('');
  });

  it('should trim leading and trailing whitespace', () => {
    expect(formatName('  john  ')).toBe('John');
  });
});
