import testRender from '@/utils/test/test-render';
import { publicDocumentListItemFragment$data } from '@generated/publicDocumentListItemFragment.graphql';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import { IntegrationType } from '@graphql/generated';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PublicShareableResourceList } from './PublicShareableResourceList';

vi.mock('@/hooks/use-scroll-position', () => ({
  __esModule: true,
  default: () => ({ save: vi.fn() }),
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
        serviceInstance={serviceInstance as seoServiceInstanceFragment$data}
        baseUrl="https://xtm.local"
      />
    );

    expect(screen.getByText('Utils.DocumentNotFound')).toBeInTheDocument();
  });

  it('groups integrations by integration_type and renders document names with correct links', async () => {
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

    const { user } = testRender(
      <PublicShareableResourceList
        documents={documents as publicDocumentListItemFragment$data[]}
        serviceInstance={serviceInstance as seoServiceInstanceFragment$data}
        baseUrl="https://xtm.local"
      />
    );

    expect(
      screen.getByText(
        `Service.OpenctiIntegrations.Type.${IntegrationType.Connector}`
      )
    ).toBeInTheDocument();
    expect(screen.getByText('My Dashboard')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: new RegExp(
          `Service\\.OpenctiIntegrations\\.Type\\.${IntegrationType.Connector}`
        ),
      })
    );
    expect(screen.getByText('My Connector')).toBeInTheDocument();

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
