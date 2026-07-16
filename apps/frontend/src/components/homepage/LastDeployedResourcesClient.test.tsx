import { LastDeployedPlatform } from '@/components/homepage/LastDeployedResourcesSection';
import testRender from '@/utils/test/test-render';
import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LastDeployedResourcesClient from './LastDeployedResourcesClient';

const { mockUseLastDeployedOverviewQueryQuery } = vi.hoisted(() => ({
  mockUseLastDeployedOverviewQueryQuery: vi.fn(),
}));

vi.mock('@graphql/generated', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@graphql/generated')>()),
  useLastDeployedOverviewQueryQuery: mockUseLastDeployedOverviewQueryQuery,
}));

vi.mock('@/lib/graphql-client', () => ({ portalGraphqlClient: {} }));

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

const buildPlatform = (
  serviceInstanceId: string,
  title: string,
  productName = 'OpenCTI'
): LastDeployedPlatform => ({ serviceInstanceId, title, productName });

const mockOverview = (resources: unknown[], isLoading = false) =>
  mockUseLastDeployedOverviewQueryQuery.mockReturnValue({
    data: { lastDeployedOverview: { resources } },
    isLoading,
  });

describe('LastDeployedResourcesClient', () => {
  beforeEach(() => {
    mockUseLastDeployedOverviewQueryQuery.mockReset();
  });

  it('renders the title, the selected switcher label and the deployed rows', () => {
    mockOverview([buildResource()]);

    testRender(
      <LastDeployedResourcesClient
        platforms={[buildPlatform('platform-1', 'OpenCTI Platform')]}
      />
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('OpenCTI - OpenCTI Platform')).toBeInTheDocument();
    expect(screen.getByText('My Custom View')).toBeInTheDocument();
    expect(screen.getByText('On')).toBeInTheDocument();
    expect(screen.getByText('By')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders the empty state image when the selected platform has no resources', () => {
    mockOverview([]);

    testRender(
      <LastDeployedResourcesClient
        platforms={[buildPlatform('platform-1', 'OpenCTI Platform')]}
      />
    );

    expect(screen.getByRole('img', { name: 'ImageAlt' })).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
  });

  it('fetches the overview for the first platform by default', () => {
    mockOverview([buildResource()]);

    testRender(
      <LastDeployedResourcesClient
        platforms={[
          buildPlatform('platform-1', 'OpenCTI Platform'),
          buildPlatform('platform-2', 'OpenAEV Platform', 'OpenAEV'),
        ]}
      />
    );

    expect(mockUseLastDeployedOverviewQueryQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ serviceInstanceId: 'platform-1' })
    );
  });
});
