import testRender from '@/utils/test/test-render';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ShareableResourceCardFooterVersion } from './ShareableResourceCardFooterVersions';

vi.mock('@filigran/ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@filigran/ui')>()),
  SimpleTooltip: ({
    title,
    children,
  }: {
    title: ReactNode;
    children: ReactNode;
  }) => (
    <>
      <span data-testid="tooltip-title">{title}</span>
      {children}
    </>
  ),
}));

const PRODUCT_VERSION = '6.8.3';

describe('ShareableResourceCardFooterVersion', () => {
  const document = {
    id: 'doc-1',
    product_version: PRODUCT_VERSION,
    manager_supported: true,
  };

  it('renders plain text product version for public path', () => {
    testRender(
      <ShareableResourceCardFooterVersion
        document={document as documentItem_fragment$data}
        publicPath
        shareLinkUrl="https://share"
      />
    );

    expect(screen.getByText(PRODUCT_VERSION)).toBeInTheDocument();
  });

  it('renders plain text when manager_supported is false', () => {
    testRender(
      <ShareableResourceCardFooterVersion
        document={
          {
            ...document,
            manager_supported: false,
          } as documentItem_fragment$data
        }
        shareLinkUrl="https://share"
      />
    );

    expect(screen.getByText(PRODUCT_VERSION)).toBeInTheDocument();
  });

  it('renders version with share button when manager_supported is true', () => {
    testRender(
      <ShareableResourceCardFooterVersion
        document={document as documentItem_fragment$data}
        shareLinkUrl="https://share"
        extraContent={<span>extra</span>}
      />
    );

    expect(screen.getByText(PRODUCT_VERSION)).toBeInTheDocument();
    expect(screen.getByText('extra')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('greys out only the version label when incompatible with the selected filter', () => {
    const { container } = testRender(
      <ShareableResourceCardFooterVersion
        document={document as documentItem_fragment$data}
        publicPath
        shareLinkUrl="https://share"
        isIncompatibleWithSelectedVersion
        incompatibleTooltip="Requires a newer version"
      />
    );

    const incompatibleLabel = container.querySelector('[data-incompatible]');
    expect(incompatibleLabel).toHaveAttribute('data-incompatible', 'true');
    expect(incompatibleLabel).toHaveTextContent(PRODUCT_VERSION);
    expect(screen.getByTestId('tooltip-title')).toHaveTextContent(
      'Requires a newer version'
    );
  });

  it('prefers the connector version over product_version when both are set', () => {
    const CONNECTOR_VERSION = '1.4.2';
    testRender(
      <ShareableResourceCardFooterVersion
        document={
          {
            ...document,
            version: CONNECTOR_VERSION,
          } as documentItem_fragment$data
        }
        publicPath
        shareLinkUrl="https://share"
      />
    );

    expect(screen.getByText(CONNECTOR_VERSION)).toBeInTheDocument();
    expect(screen.queryByText(PRODUCT_VERSION)).not.toBeInTheDocument();
  });
});
