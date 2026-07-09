import { ServiceDefinitionIdentifier } from '@graphql/generated';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockFetcher,
  mockNewestResources,
  mockMostDeployedResources,
  mockPrivateHomepageRoadmapSection,
} = vi.hoisted(() => ({
  mockFetcher: vi.fn(),
  mockNewestResources: vi.fn(() => <div data-testid="newest-resources" />),
  mockMostDeployedResources: vi.fn(() => (
    <div data-testid="most-deployed-resources" />
  )),
  mockPrivateHomepageRoadmapSection: vi.fn(() => (
    <div data-testid="private-homepage-roadmap-section" />
  )),
}));

vi.mock('@graphql/generated', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@graphql/generated')>();
  return {
    ...actual,
    useRegisteredPlatformsQuery: {
      fetcher: mockFetcher,
    },
  };
});

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

import { PlatformIdentifier } from '@graphql/generated';
import { PrivateHomepage } from './PrivateHomepage';

describe('PrivateHomepage', () => {
  beforeEach(() => {
    mockFetcher.mockClear();
    mockNewestResources.mockClear();
    mockMostDeployedResources.mockClear();
    mockPrivateHomepageRoadmapSection.mockClear();
  });

  it('passes a single-item platformIdentifiers array when only one platform is registered', async () => {
    mockFetcher.mockReturnValue(() =>
      Promise.resolve({
        registeredPlatforms: [
          {
            id: '1',
            identifier: ServiceDefinitionIdentifier.OpenctiRegistration,
          },
        ],
      })
    );

    const element = await PrivateHomepage();
    render(element);

    expect(mockFetcher).toHaveBeenCalledTimes(1);
    expect(mockFetcher.mock.calls[0]?.[1]).toEqual({
      input: { identifier: null, onlyActive: true, onlyTrial: null },
    });
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
        platformIdentifiers: [PlatformIdentifier.Opencti],
      }),
      undefined
    );
    expect(mockMostDeployedResources).toHaveBeenCalledWith(
      expect.objectContaining({
        platformIdentifiers: [PlatformIdentifier.Opencti],
      }),
      undefined
    );
  });

  it('passes undefined platformIdentifiers when multiple different platforms are registered', async () => {
    mockFetcher.mockReturnValue(() =>
      Promise.resolve({
        registeredPlatforms: [
          {
            id: '1',
            identifier: ServiceDefinitionIdentifier.OpenctiRegistration,
          },
          {
            id: '2',
            identifier: ServiceDefinitionIdentifier.OpenaevRegistration,
          },
        ],
      })
    );

    const element = await PrivateHomepage();
    render(element);

    expect(mockFetcher).toHaveBeenCalledTimes(1);
    expect(mockFetcher.mock.calls[0]?.[1]).toEqual({
      input: { identifier: null, onlyActive: true, onlyTrial: null },
    });
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

  it('passes undefined platformIdentifiers when no platforms are registered', async () => {
    mockFetcher.mockReturnValue(() =>
      Promise.resolve({
        registeredPlatforms: [],
      })
    );

    const element = await PrivateHomepage();
    render(element);

    expect(mockFetcher).toHaveBeenCalledTimes(1);
    expect(mockFetcher.mock.calls[0]?.[1]).toEqual({
      input: { identifier: null, onlyActive: true, onlyTrial: null },
    });
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

  it('renders roadmap section', async () => {
    mockFetcher.mockReturnValue(() =>
      Promise.resolve({
        registeredPlatforms: [],
      })
    );

    render(await PrivateHomepage());

    expect(screen.getByTestId('private-homepage-roadmap-section')).toBeTruthy();
  });
});
