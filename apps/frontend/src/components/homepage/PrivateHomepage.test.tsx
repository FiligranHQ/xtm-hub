import MeLoaderQuery from '@generated/meLoaderQuery.graphql';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
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
  mockRegisteredPlatformsSection,
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
  mockRegisteredPlatformsSection: vi.fn(() => (
    <div data-testid="registered-platforms-section" />
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

vi.mock('@/components/homepage/RegisteredPlatformsSection', () => ({
  RegisteredPlatformsSection: mockRegisteredPlatformsSection,
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
    mockRegisteredPlatformsSection.mockClear();

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

    const element = await PrivateHomepage();
    render(element);

    expect(mockRegisteredPlatformsFetcher).toHaveBeenCalledTimes(1);
    expect(mockServiceInstancesFetcher).not.toHaveBeenCalled();
    expect(mockServerFetchGraphQL).toHaveBeenCalledWith(MeLoaderQuery);
    expect(mockXtmPlatform).not.toHaveBeenCalled();

    expect(mockRegisteredPlatformsFetcher.mock.calls[0]?.[1]).toEqual({
      input: { identifier: null, onlyActive: true, onlyTrial: null },
    });

    expect(mockRegisteredPlatformsSection).toHaveBeenCalledWith(
      expect.objectContaining({
        welcomeName: undefined,
        registeredIdentifiers: [
          ServiceDefinitionIdentifier.OpenctiRegistration,
        ],
        registeredPlatformsData: expect.objectContaining({
          registeredPlatforms: expect.any(Array),
        }),
      }),
      undefined
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

    expect(screen.getByTestId('registered-platforms-section')).toBeTruthy();
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
    expect(mockServiceInstancesFetcher).not.toHaveBeenCalled();
    expect(mockServerFetchGraphQL).toHaveBeenCalledWith(MeLoaderQuery);
    expect(mockXtmPlatform).not.toHaveBeenCalled();

    expect(mockRegisteredPlatformsSection).toHaveBeenCalledWith(
      expect.objectContaining({
        welcomeName: undefined,
        registeredIdentifiers: [
          ServiceDefinitionIdentifier.OpenctiRegistration,
          ServiceDefinitionIdentifier.OpenaevRegistration,
        ],
      }),
      undefined
    );

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
    expect(mockRegisteredPlatformsSection).toHaveBeenCalledWith(
      expect.objectContaining({
        welcomeName: undefined,
        registeredIdentifiers: [],
      }),
      undefined
    );
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

    expect(mockPrivateHomepageRoadmapSection).toHaveBeenCalledWith(
      expect.objectContaining({
        registeredIdentifiers: [],
      }),
      undefined
    );
    expect(screen.getByTestId('private-homepage-roadmap-section')).toBeTruthy();
  });
});
