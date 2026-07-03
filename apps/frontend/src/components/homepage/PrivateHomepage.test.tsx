import MeLoaderQuery from '@generated/meLoaderQuery.graphql';
import { OrderingModeEnum } from '@generated/models/OrderingMode.enum';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { ServiceDefinitionIdentifierEnum } from '@generated/models/ServiceDefinitionIdentifier.enum';
import { ServiceInstanceFilterKeyEnum } from '@generated/models/ServiceInstanceFilterKey.enum';
import { ServiceInstanceOrderingEnum } from '@generated/models/ServiceInstanceOrdering.enum';
import { ServiceDefinitionIdentifier } from '@graphql/generated';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockRegisteredPlatformsFetcher,
  mockServiceInstancesFetcher,
  mockServerFetchGraphQL,
  mockNewestResources,
  mockMostDeployedResources,
  mockPrivateHomepageRoadmapSection,
  mockXtmPlatform,
  mockRegisteredPlatformCard,
  mockTryOtherPlatformProductBlock,
} = vi.hoisted(() => ({
  mockRegisteredPlatformsFetcher: vi.fn(),
  mockServiceInstancesFetcher: vi.fn(),
  mockServerFetchGraphQL: vi.fn(),
  mockNewestResources: vi.fn(() => <div data-testid="newest-resources" />),
  mockMostDeployedResources: vi.fn(() => (
    <div data-testid="most-deployed-resources" />
  )),
  mockPrivateHomepageRoadmapSection: vi.fn(() => (
    <div data-testid="private-homepage-roadmap-section" />
  )),
  mockXtmPlatform: vi.fn(() => <div data-testid="xtm-platform" />),
  mockRegisteredPlatformCard: vi.fn(() => (
    <div data-testid="registered-platform-card" />
  )),
  mockTryOtherPlatformProductBlock: vi.fn(() => (
    <div data-testid="try-other-platform-product-block" />
  )),
}));

vi.mock('@graphql/generated', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@graphql/generated')>();
  return {
    ...actual,
    useRegisteredPlatformsQuery: {
      fetcher: mockRegisteredPlatformsFetcher,
    },
    useServiceInstancesListQuery: {
      fetcher: mockServiceInstancesFetcher,
    },
  };
});

vi.mock('@/relay/server-portal-api-fetch', () => ({
  serverFetchGraphQL: mockServerFetchGraphQL,
}));

vi.mock('next-intl/server', () => ({
  getLocale: vi.fn().mockResolvedValue('en'),
}));

vi.mock('@/lib/graphql-client', () => ({
  getAuthenticatedGraphqlClient: vi.fn().mockResolvedValue({}),
}));

vi.mock('@/components/homepage/NewestResources', () => ({
  default: mockNewestResources,
}));

vi.mock('@/components/homepage/MostDeployedResources', () => ({
  default: mockMostDeployedResources,
}));

vi.mock('@/components/homepage/PrivateHomepageRoadmapSection', () => ({
  default: mockPrivateHomepageRoadmapSection,
}));

vi.mock('@/components/homepage/XtmPlatform', () => ({
  default: mockXtmPlatform,
}));

vi.mock('@/components/homepage/RegisteredPlatformCard', () => ({
  default: mockRegisteredPlatformCard,
}));

vi.mock('@/components/homepage/TryOtherPlatformProductBlock', () => ({
  default: mockTryOtherPlatformProductBlock,
}));

import { PrivateHomepage } from './PrivateHomepage';

describe('PrivateHomepage', () => {
  beforeEach(() => {
    mockRegisteredPlatformsFetcher.mockClear();
    mockServiceInstancesFetcher.mockClear();
    mockServerFetchGraphQL.mockClear();
    mockServerFetchGraphQL.mockResolvedValue({ data: { me: null } });
    mockNewestResources.mockClear();
    mockMostDeployedResources.mockClear();
    mockPrivateHomepageRoadmapSection.mockClear();
    mockXtmPlatform.mockClear();
    mockRegisteredPlatformCard.mockClear();
    mockTryOtherPlatformProductBlock.mockClear();

    mockServiceInstancesFetcher.mockReturnValue(() =>
      Promise.resolve({
        serviceInstances: {
          edges: [],
        },
      })
    );
  });

  it('passes a single-item platformIdentifiers array and renders cards when one platform is registered', async () => {
    mockRegisteredPlatformsFetcher.mockReturnValue(() =>
      Promise.resolve({
        registeredPlatforms: [
          {
            id: '1',
            identifier: ServiceDefinitionIdentifier.OpenctiRegistration,
            title: 'OpenCTI Platform',
            contract: 'CE',
            subscription: {
              start_date: '2026-01-01T00:00:00.000Z',
              end_date: null,
            },
          },
        ],
      })
    );

    mockServiceInstancesFetcher
      .mockReturnValueOnce(() =>
        Promise.resolve({
          serviceInstances: {
            edges: [{ node: { id: 'svc-opencti' } }],
          },
        })
      )
      .mockReturnValueOnce(() =>
        Promise.resolve({
          serviceInstances: {
            edges: [{ node: { id: 'svc-openaev' } }],
          },
        })
      );

    const element = await PrivateHomepage();
    render(element);

    expect(mockRegisteredPlatformsFetcher).toHaveBeenCalledTimes(1);
    expect(mockServiceInstancesFetcher).toHaveBeenCalledTimes(2);
    expect(mockServerFetchGraphQL).not.toHaveBeenCalled();
    expect(mockXtmPlatform).not.toHaveBeenCalled();

    expect(mockRegisteredPlatformsFetcher.mock.calls[0]?.[1]).toEqual({
      input: { identifier: null, onlyActive: true, onlyTrial: null },
    });
    expect(mockServiceInstancesFetcher).toHaveBeenNthCalledWith(
      1,
      {},
      {
        count: 1,
        orderBy: ServiceInstanceOrderingEnum.NAME,
        orderMode: OrderingModeEnum.ASC,
        filters: [
          {
            key: ServiceInstanceFilterKeyEnum.SERVICE_DEFINITION_IDENTIFIER,
            value: [ServiceDefinitionIdentifierEnum.OPENCTI_INTEGRATIONS],
          },
        ],
        searchTerm: null,
      }
    );
    expect(mockServiceInstancesFetcher).toHaveBeenNthCalledWith(
      2,
      {},
      {
        count: 1,
        orderBy: ServiceInstanceOrderingEnum.NAME,
        orderMode: OrderingModeEnum.ASC,
        filters: [
          {
            key: ServiceInstanceFilterKeyEnum.SERVICE_DEFINITION_IDENTIFIER,
            value: [ServiceDefinitionIdentifierEnum.OPENAEV_SCENARIOS],
          },
        ],
        searchTerm: null,
      }
    );

    expect(mockPrivateHomepageRoadmapSection).toHaveBeenCalledWith(
      expect.objectContaining({
        registeredIdentifiers: [
          ServiceDefinitionIdentifier.OpenctiRegistration,
        ],
      }),
      undefined
    );
    expect(mockNewestResources).toHaveBeenCalledWith(
      expect.objectContaining({
        platformIdentifiers: [PlatformIdentifierEnum.OPENCTI],
      }),
      undefined
    );
    expect(mockMostDeployedResources).toHaveBeenCalledWith(
      expect.objectContaining({
        platformIdentifiers: [PlatformIdentifierEnum.OPENCTI],
      }),
      undefined
    );

    expect(mockTryOtherPlatformProductBlock).toHaveBeenCalledWith(
      expect.objectContaining({ product: PlatformIdentifierEnum.OPENAEV }),
      undefined
    );
    expect(screen.getByTestId('registered-platform-card')).toBeTruthy();
    expect(screen.getByTestId('try-other-platform-product-block')).toBeTruthy();
  });

  it('passes undefined platformIdentifiers and hides cross-sell block when both products are registered', async () => {
    mockRegisteredPlatformsFetcher.mockReturnValue(() =>
      Promise.resolve({
        registeredPlatforms: [
          {
            id: '1',
            identifier: ServiceDefinitionIdentifier.OpenctiRegistration,
            title: 'OpenCTI Platform',
            contract: 'CE',
            subscription: {
              start_date: '2026-01-01T00:00:00.000Z',
              end_date: null,
            },
          },
          {
            id: '2',
            identifier: ServiceDefinitionIdentifier.OpenaevRegistration,
            title: 'OpenAEV Platform',
            contract: 'EE',
            subscription: {
              start_date: '2026-01-01T00:00:00.000Z',
              end_date: null,
            },
          },
        ],
      })
    );

    const element = await PrivateHomepage();
    render(element);

    expect(mockRegisteredPlatformsFetcher).toHaveBeenCalledTimes(1);
    expect(mockServiceInstancesFetcher).toHaveBeenCalledTimes(2);
    expect(mockServerFetchGraphQL).not.toHaveBeenCalled();
    expect(mockXtmPlatform).not.toHaveBeenCalled();
    expect(mockTryOtherPlatformProductBlock).not.toHaveBeenCalled();
    expect(mockPrivateHomepageRoadmapSection).toHaveBeenCalledWith(
      expect.objectContaining({
        registeredIdentifiers: [
          ServiceDefinitionIdentifier.OpenctiRegistration,
          ServiceDefinitionIdentifier.OpenaevRegistration,
        ],
      }),
      undefined
    );
    expect(mockNewestResources).toHaveBeenCalledWith(
      expect.objectContaining({ platformIdentifiers: undefined }),
      undefined
    );
    expect(mockMostDeployedResources).toHaveBeenCalledWith(
      expect.objectContaining({ platformIdentifiers: undefined }),
      undefined
    );
  });

  it('renders XtmPlatform when no platforms are registered', async () => {
    mockRegisteredPlatformsFetcher.mockReturnValue(() =>
      Promise.resolve({
        registeredPlatforms: [],
      })
    );

    const element = await PrivateHomepage();
    render(element);

    expect(mockRegisteredPlatformsFetcher).toHaveBeenCalledTimes(1);
    expect(mockServiceInstancesFetcher).not.toHaveBeenCalled();
    expect(mockServerFetchGraphQL).toHaveBeenCalledWith(MeLoaderQuery);
    expect(mockXtmPlatform).toHaveBeenCalledWith(
      expect.objectContaining({ welcomeName: undefined }),
      undefined
    );
    expect(screen.getByTestId('xtm-platform')).toBeTruthy();
    expect(mockRegisteredPlatformCard).not.toHaveBeenCalled();
    expect(mockTryOtherPlatformProductBlock).not.toHaveBeenCalled();
    expect(mockPrivateHomepageRoadmapSection).toHaveBeenCalledWith(
      expect.objectContaining({
        registeredIdentifiers: [],
      }),
      undefined
    );
    expect(mockNewestResources).toHaveBeenCalledWith(
      expect.objectContaining({ platformIdentifiers: undefined }),
      undefined
    );
    expect(mockMostDeployedResources).toHaveBeenCalledWith(
      expect.objectContaining({ platformIdentifiers: undefined }),
      undefined
    );
  });

  it('passes personalized welcome name when me has names', async () => {
    mockRegisteredPlatformsFetcher.mockReturnValue(() =>
      Promise.resolve({
        registeredPlatforms: [],
      })
    );
    mockServerFetchGraphQL.mockResolvedValue({
      data: {
        me: {
          first_name: 'Jane',
          last_name: 'Doe',
        },
      },
    });

    render(await PrivateHomepage());

    expect(mockXtmPlatform).toHaveBeenCalledWith(
      expect.objectContaining({ welcomeName: 'Jane Doe' }),
      undefined
    );
  });

  it('falls back to default XtmPlatform label when me has no names', async () => {
    mockRegisteredPlatformsFetcher.mockReturnValue(() =>
      Promise.resolve({
        registeredPlatforms: [],
      })
    );
    mockServerFetchGraphQL.mockResolvedValue({
      data: {
        me: {
          first_name: ' ',
          last_name: null,
        },
      },
    });

    render(await PrivateHomepage());

    expect(mockXtmPlatform).toHaveBeenCalledWith(
      expect.objectContaining({ welcomeName: undefined }),
      undefined
    );
  });

  it('renders roadmap section', async () => {
    mockRegisteredPlatformsFetcher.mockReturnValue(() =>
      Promise.resolve({
        registeredPlatforms: [],
      })
    );

    render(await PrivateHomepage());

    expect(screen.getByTestId('private-homepage-roadmap-section')).toBeTruthy();
  });
});
