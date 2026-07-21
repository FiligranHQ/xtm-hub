import testRender from '@/utils/test/test-render';
import { IntegrationType } from '@graphql/generated';
import { screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import ShareableResourceCard from './ShareableResourceCard';

const saveMock = vi.fn();
const useIsFeatureEnabledMock = vi.fn();

vi.mock('@/hooks/use-scroll-position', () => ({
  __esModule: true,
  default: () => ({ save: saveMock }),
}));

vi.mock('@/hooks/use-is-feature-enabled', () => ({
  useIsFeatureEnabled: () => useIsFeatureEnabledMock(),
}));

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({
    href,
    onClick,
    children,
  }: {
    href: string;
    onClick?: () => void;
    children: ReactNode;
  }) => (
    <a
      href={href}
      onClick={onClick}>
      {children}
    </a>
  ),
}));

vi.mock(
  '@/components/ui/shareable-resource/card-design/ShareableResourceCardHeader',
  () => ({
    ShareableResourceCardHeader: ({
      shouldDisplayBothIcons,
    }: {
      shouldDisplayBothIcons: boolean;
    }) => <div data-testid="card-header">{String(shouldDisplayBothIcons)}</div>,
  })
);

vi.mock(
  '@/components/ui/shareable-resource/card-design/ShareableResourceCardDescription',
  () => ({
    ShareableResourceCardDescription: ({
      description,
    }: {
      description?: string;
    }) => <div data-testid="card-description">{description}</div>,
  })
);

vi.mock('@/components/ui/BadgeOverflowCounter', () => ({
  __esModule: true,
  default: () => <div data-testid="badge-overflow">badges</div>,
}));

vi.mock(
  '@/components/ui/shareable-resource/card-design/ShareableResourceCardFooterVersions',
  () => ({
    ShareableResourceCardFooterVersion: () => (
      <div data-testid="footer-version" />
    ),
  })
);

vi.mock(
  '@/components/ui/shareable-resource/card-design/ShareableResourceCardFooterAuthor',
  () => ({
    ShareableResourceCardFooterAuthor: ({
      shouldDisplayAuthor,
    }: {
      shouldDisplayAuthor: boolean;
    }) => <div data-testid="footer-author">{String(shouldDisplayAuthor)}</div>,
  })
);

describe('ShareableResourceCard', () => {
  const serviceInstance = { id: 'service-id' };

  it('renders connector card branch and connector footer', () => {
    useIsFeatureEnabledMock.mockReturnValue(true);

    testRender(
      <ShareableResourceCard
        document={
          {
            id: 'doc-1',
            name: 'Connector',
            type: 'opencti_integration',
            short_description: 'desc',
            integration_type: IntegrationType.Connector,
            use_cases: [],
          } as never
        }
        detailUrl="/details"
        shareLinkUrl="/share"
        serviceInstance={serviceInstance}
      />
    );

    expect(screen.getByTestId('card-header')).toHaveTextContent('true');
    expect(screen.getByTestId('badge-overflow')).toBeInTheDocument();
    expect(screen.getByTestId('footer-version')).toBeInTheDocument();
  });

  it('renders non-connector branch and computes shouldDisplayAuthor=false for third-party integration', async () => {
    useIsFeatureEnabledMock.mockReturnValue(false);
    const { container, user } = testRender(
      <ShareableResourceCard
        document={
          {
            id: 'doc-2',
            name: 'Third party',
            type: 'opencti_integration',
            short_description: 'desc',
            integration_type: IntegrationType.ThirdPartyIntegration,
          } as never
        }
        detailUrl="/details"
        shareLinkUrl="/share"
        serviceInstance={serviceInstance}
      />
    );

    expect(screen.getByTestId('footer-author')).toHaveTextContent('false');
    expect(screen.queryByTestId('footer-version')).not.toBeInTheDocument();
    expect(container.firstChild).toHaveClass('h-[348px]');

    await user.click(screen.getByRole('link'));
    expect(saveMock).toHaveBeenCalledTimes(1);
  });
});
