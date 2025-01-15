import { FormatDate } from '@/utils/date';
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
      () => FormatDate('2024-11-08T10:20:30Z', false),
      {
        wrapper,
      }
    );
    expect(result.current).toBe('08/11/2024');
  });

  it('should return null for undefined input', () => {
    expect(FormatDate(undefined)).toBe(null);
  });

  it('should return null for empty string input', () => {
    expect(FormatDate('')).toBe(null);
  });

  it('should return null for invalid date input', () => {
    expect(FormatDate(null)).toBe(null);
  });
});
