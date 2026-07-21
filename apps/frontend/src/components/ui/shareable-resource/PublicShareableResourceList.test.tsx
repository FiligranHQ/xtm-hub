import testRender from '@/utils/test/test-render';
import { IntegrationType } from '@graphql/generated';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PublicShareableResourceList } from './PublicShareableResourceList';

vi.mock('@/components/ui/shareable-resource/ShareableResourceCard', () => ({
  __esModule: true,
  default: ({
    detailUrl,
    shareLinkUrl,
  }: {
    detailUrl: string;
    shareLinkUrl: string;
  }) => (
    <li data-testid="shareable-resource-card">
      {detailUrl}|{shareLinkUrl}
    </li>
  ),
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

  it('groups integrations by integration_type and builds detail/share URLs', () => {
    const documents = [
      {
        id: 'doc-1',
        slug: 'connector-doc',
        type: 'opencti_integration',
        integration_type: IntegrationType.Connector,
      },
      {
        id: 'doc-2',
        slug: 'dashboard-doc',
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
    expect(screen.getAllByTestId('shareable-resource-card')).toHaveLength(2);
    expect(
      screen.getByText(
        '/en/cybersecurity-solutions/my-service/connector-doc|https://xtm.local/cybersecurity-solutions/my-service/connector-doc'
      )
    ).toBeInTheDocument();
  });
});
