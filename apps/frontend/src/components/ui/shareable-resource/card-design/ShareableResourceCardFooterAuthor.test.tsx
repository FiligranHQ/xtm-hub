import testRender from '@/utils/test/test-render';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ShareableResourceCardFooterAuthor } from './ShareableResourceCardFooterAuthor';

vi.mock('@/components/service/integrations/Integration.utils', () => ({
  getIntegrationSubTypeMetadata: () => ({
    label: 'Connector subtype',
    color: '#123456',
  }),
}));

vi.mock('@/utils/format/name', () => ({
  formatPersonNames: () => 'Jane Doe',
}));

describe('ShareableResourceCardFooterAuthor', () => {
  const document = {
    id: 'doc-1',
    uploader: { picture: 'https://img' },
    integration_subtype: 'EXTERNAL_IMPORT',
  };

  it('renders subtype badge, author name and a share button', () => {
    testRender(
      <ShareableResourceCardFooterAuthor
        document={document as never}
        shareLinkUrl="https://share.local"
      />
    );

    expect(screen.getByText('Connector subtype')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('hides author block when shouldDisplayAuthor is false', () => {
    testRender(
      <ShareableResourceCardFooterAuthor
        document={document as never}
        shareLinkUrl="https://share.local"
        shouldDisplayAuthor={false}
        extraContent={<span>extra</span>}
      />
    );

    expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument();
    expect(screen.getByText('extra')).toBeInTheDocument();
  });
});
