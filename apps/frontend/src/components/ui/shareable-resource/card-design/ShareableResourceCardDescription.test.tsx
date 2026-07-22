import { useIsFeatureEnabled } from '@/hooks/use-is-feature-enabled';
import testRender from '@/utils/test/test-render';
import { describe, expect, it, vi } from 'vitest';
import { ShareableResourceCardDescription } from './ShareableResourceCardDescription';

describe('ShareableResourceCardDescription', () => {
  it('uses v2 clamp classes when feature flag is enabled', () => {
    vi.mocked(useIsFeatureEnabled).mockReturnValue(true);
    const { container } = testRender(
      <ShareableResourceCardDescription description="A description" />
    );

    expect(container.firstChild).toHaveClass('[-webkit-line-clamp:3]');
    expect(container.firstChild).toHaveClass('sm:[-webkit-line-clamp:5]');
  });

  it('uses legacy clamp classes when feature flag is disabled', () => {
    vi.mocked(useIsFeatureEnabled).mockReturnValue(false);
    const { container } = testRender(
      <ShareableResourceCardDescription description="A description" />
    );

    expect(container.firstChild).toHaveClass('[-webkit-line-clamp:5]');
    expect(container.firstChild).not.toHaveClass('[-webkit-line-clamp:3]');
  });
});
