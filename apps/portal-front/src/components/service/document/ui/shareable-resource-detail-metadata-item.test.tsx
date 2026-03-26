import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ShareableResourceDetailMetadataItem } from './shareable-resource-detail-metadata-item';

// Mock useTranslations from next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => `translated:${key}`,
}));

// Mock ShareableResourceDetailsLink
vi.mock(
  '@/components/service/document/shareable-resource-details-link',
  () => ({
    ShareableResourceDetailsLink: ({ url }: { url: string }) => (
      <a href={url}>link:{url}</a>
    ),
  })
);

// Mock ShareableResourceDetailItem
vi.mock(
  '@/components/service/document/ui/shareable-resource-detail-item',
  () => ({
    ShareableResourceDetailItem: ({
      label,
      children,
    }: {
      label: string;
      children: React.ReactNode;
    }) => (
      <div data-testid="detail-item">
        <span data-testid="label">{label}</span>
        <span data-testid="content">{children}</span>
      </div>
    ),
  })
);

describe('ShareableResourceDetailMetadataItem', () => {
  const baseData = {
    textKey: 'Some text',
    linkKey: 'https://example.com',
  } as unknown as documentItem_fragment$data;

  it('renders nothing if value is falsy', () => {
    const { container } = render(
      <ShareableResourceDetailMetadataItem
        documentData={baseData}
        metadataKey="emptyKey"
        translationKey="label"
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders text variant by default', () => {
    render(
      <ShareableResourceDetailMetadataItem
        documentData={baseData}
        metadataKey="textKey"
        translationKey="label"
      />
    );
    expect(screen.getByTestId('label')).toHaveTextContent(
      'translated:Service.ShareableResources.Details.label'
    );
    expect(screen.getByTestId('content')).toHaveTextContent('Some text');
  });

  it('renders link variant', () => {
    render(
      <ShareableResourceDetailMetadataItem
        documentData={baseData}
        metadataKey="linkKey"
        translationKey="label"
        variant="link"
      />
    );
    expect(screen.getByTestId('content').querySelector('a')).toHaveAttribute(
      'href',
      'https://example.com'
    );
    expect(screen.getByTestId('content')).toHaveTextContent(
      'link:https://example.com'
    );
  });
});
