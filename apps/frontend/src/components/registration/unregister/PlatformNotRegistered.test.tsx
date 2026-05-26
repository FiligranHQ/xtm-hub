import { UnregisterPlatformNotRegistered } from '@/components/registration/unregister/PlatformNotRegistered';
import testRender from '@/utils/test/test-render';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

describe('UnregisterPlatformNotRegistered', () => {
  it('renders the not-registered title and description', () => {
    testRender(<UnregisterPlatformNotRegistered confirm={vi.fn()} />);
    expect(
      screen.getByText('Unregister.Error.PlatformNotRegistered.Title')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Unregister.Error.PlatformNotRegistered.Description')
    ).toBeInTheDocument();
  });

  it('calls confirm immediately on mount', () => {
    const confirm = vi.fn();
    testRender(<UnregisterPlatformNotRegistered confirm={confirm} />);
    expect(confirm).toHaveBeenCalledOnce();
  });

  it('does not call confirm again on re-render', () => {
    const confirm = vi.fn();
    const { rerender } = testRender(
      <UnregisterPlatformNotRegistered confirm={confirm} />
    );
    rerender(<UnregisterPlatformNotRegistered confirm={confirm} />);
    expect(confirm).toHaveBeenCalledOnce();
  });
});
