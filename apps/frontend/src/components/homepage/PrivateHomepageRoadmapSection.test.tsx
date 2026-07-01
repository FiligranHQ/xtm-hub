import { FiligranProductEnum } from '@generated/models/FiligranProduct.enum';
import { ServiceDefinitionIdentifierEnum } from '@generated/models/ServiceDefinitionIdentifier.enum';
import { ServiceDefinitionIdentifier } from '@graphql/generated';
import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockServerFetchGraphQL, mockXtmRoadmap } = vi.hoisted(() => ({
  mockServerFetchGraphQL: vi.fn(),
  mockXtmRoadmap: vi.fn(),
}));

vi.mock('@/relay/server-portal-api-fetch', () => ({
  serverFetchGraphQL: mockServerFetchGraphQL,
}));

vi.mock('@/components/homepage/XtmRoadmap', () => ({
  default: mockXtmRoadmap,
}));

import PrivateHomepageRoadmapSection from './PrivateHomepageRoadmapSection';

describe('PrivateHomepageRoadmapSection', () => {
  beforeEach(() => {
    mockServerFetchGraphQL.mockReset();
    mockXtmRoadmap.mockReset();
    mockXtmRoadmap.mockReturnValue(<div data-testid="xtm-roadmap" />);
  });

  it('passes OCTI product filter when only OCTI is active', async () => {
    mockServerFetchGraphQL.mockResolvedValue({
      data: {
        serviceInstances: {
          edges: [{ node: { id: 'roadmap-1' } }],
        },
      },
    });

    render(
      await PrivateHomepageRoadmapSection({
        locale: 'en',
        registeredIdentifiers: [
          ServiceDefinitionIdentifier.OpenctiRegistration,
        ],
      })
    );

    expect(mockXtmRoadmap).toHaveBeenCalledWith(
      expect.objectContaining({
        seeMoreHref: `/app/service/xtm_platform_roadmap/roadmap-1?product=${FiligranProductEnum.OPENCTI}`,
        titleKey: 'OpenCTITitle',
      }),
      undefined
    );
  });

  it('passes OAEV product filter when only OAEV is active', async () => {
    mockServerFetchGraphQL.mockResolvedValue({
      data: {
        serviceInstances: {
          edges: [{ node: { id: 'roadmap-2' } }],
        },
      },
    });

    render(
      await PrivateHomepageRoadmapSection({
        locale: 'en',
        registeredIdentifiers: [
          ServiceDefinitionIdentifier.OpenaevRegistration,
        ],
      })
    );

    expect(mockXtmRoadmap).toHaveBeenCalledWith(
      expect.objectContaining({
        seeMoreHref: `/app/service/xtm_platform_roadmap/roadmap-2?product=${FiligranProductEnum.OPENAEV}`,
        titleKey: 'OpenAEVTitle',
      }),
      undefined
    );
  });

  it('uses full roadmap when both platforms are active', async () => {
    mockServerFetchGraphQL.mockResolvedValue({
      data: {
        serviceInstances: {
          edges: [{ node: { id: 'roadmap-3' } }],
        },
      },
    });

    render(
      await PrivateHomepageRoadmapSection({
        locale: 'en',
        registeredIdentifiers: [
          ServiceDefinitionIdentifier.OpenctiRegistration,
          ServiceDefinitionIdentifier.OpenaevRegistration,
        ],
      })
    );

    expect(mockXtmRoadmap).toHaveBeenCalledWith(
      expect.objectContaining({
        seeMoreHref: '/app/service/xtm_platform_roadmap/roadmap-3',
        titleKey: 'Title',
      }),
      undefined
    );
  });

  it('uses full roadmap when no active platform is registered', async () => {
    mockServerFetchGraphQL.mockResolvedValue({
      data: {
        serviceInstances: {
          edges: [{ node: { id: 'roadmap-0' } }],
        },
      },
    });

    render(
      await PrivateHomepageRoadmapSection({
        locale: 'en',
        registeredIdentifiers: [],
      })
    );

    expect(mockXtmRoadmap).toHaveBeenCalledWith(
      expect.objectContaining({
        seeMoreHref: '/app/service/xtm_platform_roadmap/roadmap-0',
        titleKey: 'Title',
      }),
      undefined
    );
  });

  it('returns null when no roadmap service instance exists', async () => {
    mockServerFetchGraphQL.mockResolvedValue({
      data: {
        serviceInstances: {
          edges: [],
        },
      },
    });

    const result = await PrivateHomepageRoadmapSection({
      locale: 'en',
      registeredIdentifiers: [],
    });

    expect(result).toBeNull();
    expect(mockXtmRoadmap).not.toHaveBeenCalled();
  });

  it('queries roadmap service instances by identifier', async () => {
    mockServerFetchGraphQL.mockResolvedValue({
      data: {
        serviceInstances: {
          edges: [{ node: { id: 'roadmap-4' } }],
        },
      },
    });

    await PrivateHomepageRoadmapSection({
      locale: 'en',
      registeredIdentifiers: [],
    });

    expect(mockServerFetchGraphQL).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        count: 1,
        filters: [
          {
            key: 'service_definition_identifier',
            value: [ServiceDefinitionIdentifierEnum.XTM_PLATFORM_ROADMAP],
          },
        ],
      })
    );
  });
});
