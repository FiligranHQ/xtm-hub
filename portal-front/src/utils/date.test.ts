import { describe, expect, it } from 'vitest';
import { FormatDate } from '@/utils/date';

describe('date', () => {
  it('should return formatted date for valid input', () => {
    expect(FormatDate('2023-06-03T10:20:30Z')).toBe('03/06/2023 10:20:30');
  });

  it('should return null for undefined input', () => {
    expect(FormatDate(undefined)).toBe(null);
  });

  it('should return null for empty string input', () => {
    expect(FormatDate('')).toBe(null);
  });

  it('should return null for invalid date input', () => {
    expect(FormatDate('invalid-date')).toBe(null);
  });

  it('should pad single digit day, month, hours, minutes, and seconds with leading zeros', () => {
    expect(FormatDate('2023-01-02T03:04:05Z')).toBe('02/01/2023 03:04:05');
  });
});
