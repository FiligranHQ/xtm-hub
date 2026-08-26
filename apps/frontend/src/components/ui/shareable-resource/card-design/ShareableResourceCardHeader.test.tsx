import testRender from '@/utils/test/test-render';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ShareableResourceCardHeader } from './ShareableResourceCardHeader';

describe('ShareableResourceCardHeader', () => {
  const baseDocument: documentItem_fragment$data = {
    name: 'Short name',
    use_cases: [],
  };

  it('renders connector branch', () => {
    const { container } = testRender(
      <ShareableResourceCardHeader
        document={baseDocument}
        serviceInstanceId="svc-id"
        shouldDisplayBothIcons
        isConnector
      />
    );

    expect(screen.getByText('Short name')).toBeInTheDocument();
    expect(container.querySelector('h2')).toHaveClass('md:text-lg');
  });
});
