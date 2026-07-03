import testRender from '@/utils/test/test-render';
import {
  DeployableResourceType,
  PlatformIdentifier,
  ServiceDefinitionIdentifier,
} from '@graphql/generated';
import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockUseUndeployedResourceTypesByProductQuery,
  mockUseServiceInstancesListQuery,
} = vi.hoisted(() => ({
  mockUseUndeployedResourceTypesByProductQuery: vi.fn(),
  mockUseServiceInstancesListQuery: vi.fn(),
}));

vi.mock('@graphql/generated', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@graphql/generated')>();

  return {
    ...actual,
    useUndeployedResourceTypesByProductQuery:
      mockUseUndeployedResourceTypesByProductQuery,
    useServiceInstancesListQuery: mockUseServiceInstancesListQuery,
  };
});

import DeployFirstResourceBlock from './DeployFirstResourceBlock';

describe('DeployFirstResourceBlock', () => {
  beforeEach(() => {
    mockUseUndeployedResourceTypesByProductQuery.mockReturnValue({
      data: {
        undeployedResourceTypesByProduct: [],
      },
      isLoading: false,
      isError: false,
    });

    mockUseServiceInstancesListQuery.mockReturnValue({
      data: {
        serviceInstances: {
          edges: [
            {
              node: {
                id: 'svc-integrations',
                service_definition: {
                  identifier: ServiceDefinitionIdentifier.OpenctiIntegrations,
                },
              },
            },
          ],
        },
      },
    });
  });

  it('renders null when there is no undeployed resource type', () => {
    const { container } = testRender(<DeployFirstResourceBlock />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders the CTA block with prioritized deploy target', () => {
    mockUseUndeployedResourceTypesByProductQuery.mockReturnValue({
      data: {
        undeployedResourceTypesByProduct: [
          {
            product: PlatformIdentifier.Opencti,
            resourceTypes: [
              DeployableResourceType.CustomViews,
              DeployableResourceType.Integrations,
            ],
          },
        ],
      },
      isLoading: false,
      isError: false,
    });

    testRender(<DeployFirstResourceBlock />);

    const ctaLink = screen.getByRole('link', { name: 'Title' });

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(ctaLink).toHaveAttribute(
      'href',
      '/app/service/opencti_integrations/svc-integrations'
    );
    expect(ctaLink).toHaveClass('border-elevation-border-strong-layer-2');
  });

  it('renders OpenAEV scenario CTA when OpenCTI has no undeployed resource', () => {
    mockUseUndeployedResourceTypesByProductQuery.mockReturnValue({
      data: {
        undeployedResourceTypesByProduct: [
          {
            product: PlatformIdentifier.Openaev,
            resourceTypes: [DeployableResourceType.Scenarios],
          },
        ],
      },
      isLoading: false,
      isError: false,
    });

    mockUseServiceInstancesListQuery.mockReturnValue({
      data: {
        serviceInstances: {
          edges: [
            {
              node: {
                id: 'svc-scenarios',
                service_definition: {
                  identifier: ServiceDefinitionIdentifier.OpenaevScenarios,
                },
              },
            },
          ],
        },
      },
    });

    testRender(<DeployFirstResourceBlock />);

    expect(screen.getByRole('link', { name: 'Title' })).toHaveAttribute(
      'href',
      '/app/service/openaev_scenarios/svc-scenarios'
    );
  });
});
