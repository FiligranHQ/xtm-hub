import { describe, expect, it } from 'vitest';
import { formatTitleCase } from './case';

describe('formatTitleCase', () => {
  it.each`
    input         | expected
    ${'hello'}    | ${'Hello'}
    ${'HELLO'}    | ${'Hello'}
    ${'hElLo'}    | ${'Hello'}
    ${'world'}    | ${'World'}
    ${'a'}        | ${'A'}
    ${'A'}        | ${'A'}
    ${'openCTI'}  | ${'Opencti'}
    ${'FILIGRAN'} | ${'Filigran'}
  `('should format "$input" to "$expected"', ({ input, expected }) => {
    expect(formatTitleCase(input)).toBe(expected);
  });

  it('should handle single character strings', () => {
    expect(formatTitleCase('x')).toBe('X');
    expect(formatTitleCase('X')).toBe('X');
  });
});
