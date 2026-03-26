import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useExecuteAfterAnimation } from './useExecuteAfterAnimation';

describe('useExecuteAfterAnimation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should call callback after animation time (300ms)', () => {
    const callback = vi.fn();

    useExecuteAfterAnimation(callback);

    expect(callback).not.toHaveBeenCalled();
    vi.advanceTimersByTime(300);
    expect(callback).toHaveBeenCalledOnce();
  });

  it('should not call callback before animation time elapses', () => {
    const callback = vi.fn();

    useExecuteAfterAnimation(callback);

    vi.advanceTimersByTime(299);
    expect(callback).not.toHaveBeenCalled();
  });

  it('should call callback exactly once', () => {
    const callback = vi.fn();

    useExecuteAfterAnimation(callback);

    vi.advanceTimersByTime(600);
    expect(callback).toHaveBeenCalledOnce();
  });
});
