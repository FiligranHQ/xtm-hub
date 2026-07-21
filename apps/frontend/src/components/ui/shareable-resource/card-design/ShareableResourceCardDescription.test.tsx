import testRender from '@/utils/test/test-render';
import { describe, expect, it, vi } from 'vitest';
import { ShareableResourceCardDescription } from './ShareableResourceCardDescription';

const useIsFeatureEnabledMock = vi.fn();

vi.mock('@/hooks/use-is-feature-enabled', () => ({
  useIsFeatureEnabled: () => useIsFeatureEnabledMock(),
}));

describe('ShareableResourceCardDescription', () => {
  it('uses v2 clamp classes when feature flag is enabled', () => {
    useIsFeatureEnabledMock.mockReturnValue(true);
    const { container } = testRender(
      <ShareableResourceCardDescription description="A description" />
    );

    expect(container.firstChild).toHaveClass('[-webkit-line-clamp:3]');
    expect(container.firstChild).toHaveClass('sm:[-webkit-line-clamp:5]');
  });

  it('uses legacy clamp classes when feature flag is disabled', () => {
    useIsFeatureEnabledMock.mockReturnValue(false);
    const { container } = testRender(
      <ShareableResourceCardDescription description="A description" />
    );

    expect(container.firstChild).toHaveClass('[-webkit-line-clamp:5]');
    expect(container.firstChild).not.toHaveClass('[-webkit-line-clamp:3]');
  });
});
