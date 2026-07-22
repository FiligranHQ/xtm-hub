import testRender from '@/utils/test/test-render';
import { IntegrationType } from '@graphql/generated';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PublicShareableResourceList } from './PublicShareableResourceList';

vi.mock('@/hooks/use-scroll-position', () => ({
  __esModule: true,
  default: () => ({ save: vi.fn() }),
}));

vi.mock('@/hooks/use-is-feature-enabled', () => ({
  useIsFeatureEnabled: () => false,
}));

vi.mock('@/hooks/use-registered-platforms', () => ({
  useRegisteredPlatforms: () => ({ platforms: [] }),
}));

vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
    />
  ),
}));

vi.mock('@/utils/documents', () => ({
  findDocumentLogo: () => null,
}));

describe('PublicShareableResourceList', () => {
  const serviceInstance = {
    id: 'service-1',
    slug: 'my-service',
  };

  it('renders an empty state when no document is provided', () => {
    testRender(
      <PublicShareableResourceList
        documents={[]}
        serviceInstance={serviceInstance as never}
        baseUrl="https://xtm.local"
      />
    );

    expect(screen.getByText('Utils.DocumentNotFound')).toBeInTheDocument();
  });

  it('groups integrations by integration_type and renders document names with correct links', () => {
    const documents = [
      {
        id: 'doc-1',
        slug: 'connector-doc',
        name: 'My Connector',
        type: 'opencti_integration',
        integration_type: IntegrationType.Connector,
        use_cases: [],
      },
      {
        id: 'doc-2',
        slug: 'dashboard-doc',
        name: 'My Dashboard',
        type: 'opencti_custom_dashboard',
      },
    ];

    testRender(
      <PublicShareableResourceList
        documents={documents as never}
        serviceInstance={serviceInstance as never}
        baseUrl="https://xtm.local"
      />
    );

    expect(
      screen.getByText(
        `Service.OpenctiIntegrations.Type.${IntegrationType.Connector}`
      )
    ).toBeInTheDocument();
    expect(screen.getByText('My Connector')).toBeInTheDocument();
    expect(screen.getByText('My Dashboard')).toBeInTheDocument();

    const links = screen.getAllByRole('link');
    const connectorLink = links.find((l) =>
      l.getAttribute('href')?.includes('connector-doc')
    );
    expect(connectorLink).toHaveAttribute(
      'href',
      '/en/cybersecurity-solutions/my-service/connector-doc'
    );
  });
});
