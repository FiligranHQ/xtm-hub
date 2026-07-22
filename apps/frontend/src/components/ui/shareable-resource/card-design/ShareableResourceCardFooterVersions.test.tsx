import testRender from '@/utils/test/test-render';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ShareableResourceCardFooterVersion } from './ShareableResourceCardFooterVersions';

vi.mock('@/hooks/use-registered-platforms', () => ({
  useRegisteredPlatforms: () => ({ platforms: [] }),
}));

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
  });

  it('renders plain text when manager_supported is false', () => {
    testRender(
      <ShareableResourceCardFooterVersion
        document={{ ...document, manager_supported: false } as never}
        shareLinkUrl="https://share"
      />
    );

    expect(screen.getByText('6.8')).toBeInTheDocument();
  });

  it('renders version with share button when manager_supported is true', () => {
    testRender(
      <ShareableResourceCardFooterVersion
        document={document as never}
        shareLinkUrl="https://share"
        extraContent={<span>extra</span>}
      />
    );

    expect(screen.getByText('6.8')).toBeInTheDocument();
    expect(screen.getByText('extra')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
