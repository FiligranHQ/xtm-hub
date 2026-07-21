import testRender from '@/utils/test/test-render';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ShareableResourceCardIcon } from './ShareableResourceCardIcon';

vi.mock('@/components/ui/ResourceStatusIcons', () => ({
  ResourceStatusIcons: (props: {
    deployable?: boolean;
    verified?: boolean;
    active?: boolean;
  }) => <div data-testid="status-icons">{JSON.stringify(props)}</div>,
}));

describe('ShareableResourceCardIcon', () => {
  it('for connector-like cards, forwards deployable and verified booleans', () => {
    testRender(
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

    expect(screen.getByTestId('status-icons')).toHaveTextContent(
      '{"deployable":true,"verified":true}'
    );
  });

  it('for non-connector cards, forwards active only', () => {
    testRender(
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

    expect(screen.getByTestId('status-icons')).toHaveTextContent(
      '{"deployable":false,"verified":false,"active":true}'
    );
  });
});
