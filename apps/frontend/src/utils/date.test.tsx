import { formatDate, isWithinLastMonths } from '@/utils/date';
import { ProvidersWrapperProps, TestWrapper } from '@/utils/test/test-render';
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('date', () => {
  it('should return formatted date for valid input', () => {
    expect(true).toBe(true);
    const wrapper = ({ children }: ProvidersWrapperProps) => {
      return <TestWrapper>{children}</TestWrapper>;
    };
    const { result } = renderHook(
      () => formatDate('2024-11-08T10:20:30Z', false),
      {
        wrapper,
      }
    );
    expect(result.current).toBe('11/8/2024');
  });

  it('should return null for undefined input', () => {
    expect(formatDate(undefined)).toBe(null);
  });

  it('should return null for empty string input', () => {
    expect(formatDate('')).toBe(null);
  });

  it('should return null for invalid date input', () => {
    expect(formatDate(null)).toBe(null);
  });
});

describe('isWithinLastMonths', () => {
  it.each([
    { label: '1 month ago', monthsAgo: 1, months: 3, expected: true },
    { label: '2 months ago', monthsAgo: 2, months: 3, expected: true },
    { label: '4 months ago', monthsAgo: 4, months: 3, expected: false },
    { label: '6 months ago', monthsAgo: 6, months: 3, expected: false },
    { label: 'today', monthsAgo: 0, months: 3, expected: true },
    {
      label: '1 month ago within 1 month',
      monthsAgo: 1,
      months: 1,
      expected: false,
    },
  ])(
    '$label (within $months months) should return $expected',
    ({ monthsAgo, months, expected }) => {
      const date = new Date();
      date.setMonth(date.getMonth() - monthsAgo);
      expect(isWithinLastMonths(date, months)).toBe(expected);
    }
  );
});
