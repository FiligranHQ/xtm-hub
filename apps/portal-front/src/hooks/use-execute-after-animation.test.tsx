import { ANIMATION_TIME } from '@/utils/constant';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useExecuteAfterAnimation } from './use-execute-after-animation';

describe('useExecuteAfterAnimation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should call callback after animation time', () => {
    const callback = vi.fn();

    useExecuteAfterAnimation(callback);

    expect(callback).not.toHaveBeenCalled();
    vi.advanceTimersByTime(ANIMATION_TIME);
    expect(callback).toHaveBeenCalledOnce();
  });

  it('should not call callback before animation time elapses', () => {
    const callback = vi.fn();

    useExecuteAfterAnimation(callback);

    vi.advanceTimersByTime(ANIMATION_TIME - 1);
    expect(callback).not.toHaveBeenCalled();
  });

  it('should call callback exactly once', () => {
    const callback = vi.fn();

    useExecuteAfterAnimation(callback);

    vi.advanceTimersByTime(ANIMATION_TIME * 2);
    expect(callback).toHaveBeenCalledOnce();
  });
});
