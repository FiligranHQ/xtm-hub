import testRender from '@/utils/test/test-render';
import { screen } from '@testing-library/react';
import type { ReactNode } from 'react';
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

vi.mock('@filigran/ui/clients', () => ({
  Avatar: ({ src }: { src: string }) => <div data-testid="avatar">{src}</div>,
}));

vi.mock('@filigran/ui/servers', () => ({
  Badge: ({ children, color }: { children: ReactNode; color: string }) => (
    <div data-testid="badge">
      {children}|{color}
    </div>
  ),
}));

vi.mock('@/components/ui/share-link/ShareLinkButton', () => ({
  ShareLinkButton: ({
    documentId,
    url,
  }: {
    documentId: string;
    url: string;
  }) => (
    <div data-testid="share-link">
      {documentId}|{url}
    </div>
  ),
}));

describe('ShareableResourceCardFooterAuthor', () => {
  const document = {
    id: 'doc-1',
    uploader: { picture: 'https://img' },
    integration_subtype: 'EXTERNAL_IMPORT',
  };

  it('renders subtype badge, author info and share button', () => {
    testRender(
      <ShareableResourceCardFooterAuthor
        document={document as never}
        shareLinkUrl="https://share.local"
      />
    );

    expect(screen.getByTestId('badge')).toHaveTextContent(
      'Connector subtype|#123456'
    );
    expect(screen.getByTestId('avatar')).toHaveTextContent('https://img');
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByTestId('share-link')).toHaveTextContent(
      'doc-1|https://share.local'
    );
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
