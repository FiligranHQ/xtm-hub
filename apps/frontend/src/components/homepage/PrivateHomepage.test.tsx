import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { ServiceDefinitionIdentifier } from '@graphql/generated';
import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockFetcher, mockNewestResources, mockMostDeployedResources } =
  vi.hoisted(() => ({
    mockFetcher: vi.fn(),
    mockNewestResources: vi.fn(() => <div data-testid="newest-resources" />),
    mockMostDeployedResources: vi.fn(() => (
      <div data-testid="most-deployed-resources" />
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

import { PrivateHomepage } from './PrivateHomepage';

describe('PrivateHomepage', () => {
  beforeEach(() => {
    mockNewestResources.mockClear();
    mockMostDeployedResources.mockClear();
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

    expect(mockNewestResources).toHaveBeenCalledWith(
      expect.objectContaining({ platformIdentifiers: undefined }),
      undefined
    );
    expect(mockMostDeployedResources).toHaveBeenCalledWith(
      expect.objectContaining({ platformIdentifiers: undefined }),
      undefined
    );
  });
});
