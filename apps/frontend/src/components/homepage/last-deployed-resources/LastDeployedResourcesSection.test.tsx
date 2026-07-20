import {
  PlatformContract,
  RegisteredPlatformsQuery,
  ServiceDefinitionIdentifier,
} from '@graphql/generated';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockGetTranslations, mockTranslate, mockLastDeployedResourcesClient } =
  vi.hoisted(() => ({
    mockGetTranslations: vi.fn(),
    mockTranslate: vi.fn((key: string) => `t-${key}`),
    mockLastDeployedResourcesClient: vi.fn(() => (
      <div data-testid="last-deployed-resources-client" />
    )),
  }));

vi.mock('next-intl/server', () => ({
  getTranslations: mockGetTranslations,
}));

vi.mock('./LastDeployedResourcesClient', () => ({
  default: mockLastDeployedResourcesClient,
}));

import LastDeployedResourcesSection from './LastDeployedResourcesSection';

const buildRegisteredPlatform = (
  overrides: Partial<
    RegisteredPlatformsQuery['registeredPlatforms'][number]
  > = {}
): RegisteredPlatformsQuery['registeredPlatforms'][number] => ({
  id: 'platform-1',
  identifier: ServiceDefinitionIdentifier.OpenctiRegistration,
  title: 'OpenCTI Platform',
  contract: PlatformContract.Ee,
  subscription: {
    start_date: null,
    end_date: null,
    service_instance_id: 'svc-1',
  },
  ...overrides,
});

describe('LastDeployedResourcesSection', () => {
  beforeEach(() => {
    mockGetTranslations.mockReset();
    mockTranslate.mockClear();
    mockLastDeployedResourcesClient.mockClear();
    mockGetTranslations.mockResolvedValue(mockTranslate);
  });

  it('renders the empty state image when no platform has a deployed resource', async () => {
    const registeredPlatformsData: RegisteredPlatformsQuery = {
      registeredPlatforms: [],
    };

    render(await LastDeployedResourcesSection({ registeredPlatformsData }));

    expect(
      screen.getByRole('img', { name: 't-PublicHomePage.XtmPlatform.ImageAlt' })
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('last-deployed-resources-client')
    ).not.toBeInTheDocument();
  });

  it('renders the client component when at least one platform has a deployed resource', async () => {
    const registeredPlatformsData: RegisteredPlatformsQuery = {
      registeredPlatforms: [buildRegisteredPlatform()],
    };

    render(await LastDeployedResourcesSection({ registeredPlatformsData }));

    expect(
      screen.getByTestId('last-deployed-resources-client')
    ).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(mockLastDeployedResourcesClient).toHaveBeenCalledWith(
      {
        platforms: [
          {
            serviceInstanceId: 'svc-1',
            title: 'OpenCTI Platform',
            productName: 'OpenCTI',
          },
        ],
      },
      undefined
    );
  });

  it('ignores platforms without a deployed service instance', async () => {
    const registeredPlatformsData: RegisteredPlatformsQuery = {
      registeredPlatforms: [buildRegisteredPlatform({ subscription: null })],
    };

    render(await LastDeployedResourcesSection({ registeredPlatformsData }));

    expect(
      screen.getByRole('img', { name: 't-PublicHomePage.XtmPlatform.ImageAlt' })
    ).toBeInTheDocument();
  });
});
