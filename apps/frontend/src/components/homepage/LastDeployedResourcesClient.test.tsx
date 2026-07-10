import { LastDeployedOverview } from '@/components/homepage/LastDeployedResourcesSection';
import testRender from '@/utils/test/test-render';
import { PlatformIdentifier } from '@graphql/generated';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import LastDeployedResourcesClient from './LastDeployedResourcesClient';

const buildOverview = (resources: unknown[]): LastDeployedOverview =>
  ({
    resources,
  }) as unknown as LastDeployedOverview;

const buildResource = () => ({
  document: {
    __typename: 'CustomView',
    id: 'doc-1',
    name: 'My Custom View',
    short_description: null,
    type: 'opencti_custom_view',
    active: true,
    slug: 'my-custom-view',
    service_instance_id: 'svc-1',
    children_documents: [],
    use_cases: [
      { id: 'uc-1', name: 'Malware Analysis' },
      { id: 'uc-2', name: 'Threat Hunting' },
      { id: 'uc-3', name: 'Incident Response' },
    ],
  },
  deployedAt: '2026-07-03T10:00:00.000Z',
  deployedBy: {
    id: 'user-1',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@filigran.io',
    picture: null,
  },
});

const renderClient = (
  overview: LastDeployedOverview,
  products: PlatformIdentifier[] = [PlatformIdentifier.Opencti]
) =>
  testRender(
    <LastDeployedResourcesClient
      products={products}
      overviewByProduct={{ [PlatformIdentifier.Opencti]: overview }}
    />
  );

describe('LastDeployedResourcesClient', () => {
  it('renders the title and deployed resource rows', () => {
    renderClient(buildOverview([buildResource()]));

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('My Custom View')).toBeInTheDocument();
    expect(screen.getByText('Malware Analysis')).toBeInTheDocument();
    expect(screen.queryByText('Threat Hunting')).toBeNull();
    expect(screen.getByText('+2')).toBeInTheDocument();
    expect(screen.getByText('On')).toBeInTheDocument();
    expect(screen.getByText('By')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders the empty state image when there are no deployed resources', () => {
    renderClient(buildOverview([]));

    expect(screen.getByRole('img', { name: 'ImageAlt' })).toBeInTheDocument();
    expect(screen.queryByText('Title')).toBeNull();
    expect(screen.queryByText('By')).toBeNull();
  });

  it('does not crash when a product has no overview entry', () => {
    testRender(
      <LastDeployedResourcesClient
        products={[PlatformIdentifier.Openaev, PlatformIdentifier.Opencti]}
        overviewByProduct={{
          [PlatformIdentifier.Opencti]: buildOverview([buildResource()]),
        }}
      />
    );

    expect(screen.getByText('My Custom View')).toBeInTheDocument();
  });
});
