import testRender from '@/utils/test/test-render';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ShareableResourceCardFooterVersion } from './ShareableResourceCardFooterVersions';

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

vi.mock(
  '@/components/ui/shareable-resource/card-design/ShareableResourceCardVersion',
  () => ({
    ShareableResourceCardVersion: ({
      product_version,
      requiredProductVersion,
    }: {
      product_version?: string;
      requiredProductVersion?: string;
    }) => (
      <div data-testid="card-version">
        {product_version}|{requiredProductVersion}
      </div>
    ),
  })
);

describe('ShareableResourceCardFooterVersion', () => {
  const document = {
    id: 'doc-1',
    product_version: '6.8',
    manager_supported: true,
  };

  it('renders plain text product version for public path', () => {
    testRender(
      <ShareableResourceCardFooterVersion
        document={document as never}
        publicPath
        shareLinkUrl="https://share"
      />
    );

    expect(screen.getByText('6.8')).toBeInTheDocument();
    expect(screen.queryByTestId('card-version')).not.toBeInTheDocument();
  });

  it('renders plain text when manager_supported is false', () => {
    testRender(
      <ShareableResourceCardFooterVersion
        document={{ ...document, manager_supported: false } as never}
        shareLinkUrl="https://share"
      />
    );

    expect(screen.getByText('6.8')).toBeInTheDocument();
    expect(screen.queryByTestId('card-version')).not.toBeInTheDocument();
  });

  it('renders compatibility version component when manager_supported is true', () => {
    testRender(
      <ShareableResourceCardFooterVersion
        document={document as never}
        shareLinkUrl="https://share"
        extraContent={<span>extra</span>}
      />
    );

    expect(screen.getByTestId('card-version')).toHaveTextContent('6.8|6.8');
    expect(screen.getByTestId('share-link')).toHaveTextContent(
      'doc-1|https://share'
    );
    expect(screen.getByText('extra')).toBeInTheDocument();
  });
});
