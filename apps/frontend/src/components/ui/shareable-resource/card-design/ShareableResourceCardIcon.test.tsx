import testRender from '@/utils/test/test-render';
import { describe, expect, it } from 'vitest';
import { ShareableResourceCardIcon } from './ShareableResourceCardIcon';

describe('ShareableResourceCardIcon', () => {
  it('for connector-like cards, renders deployable and verified icons', () => {
    const { container } = testRender(
      <ShareableResourceCardIcon
        shouldDisplayBothIcons
        document={
          {
            active: true,
            manager_supported: true,
            verified: true,
          } as never
        }
      />
    );

    expect(container.querySelectorAll('svg')).toHaveLength(2);
  });

  it('for non-connector cards, renders the active icon only', () => {
    const { container } = testRender(
      <ShareableResourceCardIcon
        shouldDisplayBothIcons={false}
        document={
          {
            active: true,
            manager_supported: true,
            verified: true,
          } as never
        }
      />
    );

    expect(container.querySelectorAll('svg')).toHaveLength(1);
  });
});
