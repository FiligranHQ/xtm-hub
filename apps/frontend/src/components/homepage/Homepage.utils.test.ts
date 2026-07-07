import { FiligranProductEnum } from '@generated/models/FiligranProduct.enum';
import { PlatformContractEnum } from '@generated/models/PlatformContract.enum';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import {
  DeployableResourceType,
  DeploymentRequestHubStatus,
  DocumentImageType,
  PlatformIdentifier,
  ServiceDefinitionIdentifier,
} from '@graphql/generated';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  findLogoUrl,
  mapRegisteredPlatformsToHomepageCards,
  resolveDeployFirstResourceCtaTarget,
  resolveHomepageCrossSellProduct,
  resolveHomepagePlatformIdentifiers,
  resolveHomepageRoadmapResolution,
  resolveRemainingTrialDays,
} from './Homepage.utils';

describe('resolveHomepagePlatformIdentifiers', () => {
  it.each`
    identifiers                                                                                           | expected                            | description
    ${[]}                                                                                                 | ${undefined}                        | ${'returns undefined for an empty array'}
    ${[ServiceDefinitionIdentifier.OpenctiRegistration]}                                                  | ${[PlatformIdentifierEnum.OPENCTI]} | ${'returns [OPENCTI] for a single OPENCTI identifier'}
    ${[ServiceDefinitionIdentifier.OpenaevRegistration]}                                                  | ${[PlatformIdentifierEnum.OPENAEV]} | ${'returns [OPENAEV] for a single OPENAEV identifier'}
    ${[ServiceDefinitionIdentifier.OpenctiRegistration, ServiceDefinitionIdentifier.OpenctiRegistration]} | ${[PlatformIdentifierEnum.OPENCTI]} | ${'returns [OPENCTI] when duplicate identifiers resolve to the same platform'}
    ${[ServiceDefinitionIdentifier.OpenctiRegistration, ServiceDefinitionIdentifier.OpenaevRegistration]} | ${undefined}                        | ${'returns undefined when identifiers span two different platforms'}
    ${[ServiceDefinitionIdentifier.Vault]}                                                                | ${undefined}                        | ${'returns undefined for an unmapped identifier'}
  `('$description', ({ identifiers, expected }) => {
    expect(resolveHomepagePlatformIdentifiers(identifiers)).toEqual(expected);
  });
});

describe('resolveRemainingTrialDays', () => {
  const now = new Date('2026-01-01T00:00:00.000Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each`
    endDate                       | expected     | description
    ${null}                       | ${undefined} | ${'returns undefined when end date is missing'}
    ${'2026-01-05T00:00:00.000Z'} | ${4}         | ${'returns rounded remaining days for future trial end date'}
    ${'2025-12-30T00:00:00.000Z'} | ${0}         | ${'returns zero when trial end date is already passed'}
  `('$description', ({ endDate, expected }) => {
    expect(resolveRemainingTrialDays(endDate)).toBe(expected);
  });
});

describe('mapRegisteredPlatformsToHomepageCards', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('maps registered platforms to homepage cards and resolves deploy hrefs', () => {
    const cards = mapRegisteredPlatformsToHomepageCards([
      {
        id: 'rp-1',
        identifier: ServiceDefinitionIdentifier.OpenctiRegistration,
        title: 'OpenCTI Platform',
        contract: PlatformContractEnum.CE,
        deployment_request: null,
        subscription: {
          start_date: '2025-12-01T00:00:00.000Z',
          end_date: null,
          service_instance: {
            id: 'si-opencti',
          },
        },
      },
      {
        id: 'rp-2',
        identifier: ServiceDefinitionIdentifier.OpenaevRegistration,
        title: 'OpenAEV Trial Platform',
        contract: PlatformContractEnum.TRIAL,
        deployment_request: null,
        subscription: {
          start_date: '2025-12-15T00:00:00.000Z',
          end_date: '2026-01-03T00:00:00.000Z',
          service_instance: {
            id: 'si-openaev',
          },
        },
      },
    ] as Parameters<typeof mapRegisteredPlatformsToHomepageCards>[0]);

    expect(cards).toEqual([
      {
        id: 'rp-1',
        product: 'opencti',
        title: 'OpenCTI Platform',
        registrationDate: '2025-12-01T00:00:00.000Z',
        contract: PlatformContractEnum.CE,
        remainingTrialDays: undefined,
      },
      {
        id: 'rp-2',
        product: 'openaev',
        title: 'OpenAEV Trial Platform',
        registrationDate: '2025-12-15T00:00:00.000Z',
        contract: PlatformContractEnum.TRIAL,
        remainingTrialDays: 2,
      },
    ]);
  });

  it('adds request-only entries when platform configuration is missing and request is not cancelled', () => {
    const cards = mapRegisteredPlatformsToHomepageCards([
      {
        id: 'rp-request-opencti',
        identifier: ServiceDefinitionIdentifier.OpenctiRegistration,
        title: 'OpenCTI Requested Platform',
        contract: PlatformContractEnum.TRIAL,
        deployment_request: {
          id: 'dr-opencti',
          hub_status: DeploymentRequestHubStatus.Pending,
          request_date: '2025-12-20T00:00:00.000Z',
          start_date: null,
          end_date: '2026-01-10T00:00:00.000Z',
        },
        subscription: {
          start_date: null,
          end_date: null,
          service_instance: null,
        },
      },
      {
        id: 'rp-request-cancelled',
        identifier: ServiceDefinitionIdentifier.OpenaevRegistration,
        title: 'OpenAEV Cancelled Request',
        contract: PlatformContractEnum.TRIAL,
        deployment_request: {
          id: 'dr-openaev',
          hub_status: DeploymentRequestHubStatus.Cancelled,
          request_date: '2025-12-21T00:00:00.000Z',
          start_date: null,
          end_date: '2026-01-12T00:00:00.000Z',
        },
        subscription: {
          start_date: null,
          end_date: null,
          service_instance: null,
        },
      },
    ] as Parameters<typeof mapRegisteredPlatformsToHomepageCards>[0]);

    expect(cards).toEqual([
      {
        id: 'rp-request-opencti',
        product: 'opencti',
        title: 'OpenCTI Requested Platform',
        registrationDate: '2025-12-20T00:00:00.000Z',
        contract: PlatformContractEnum.TRIAL,
        remainingTrialDays: 9,
      },
    ]);
  });

  it('returns all configured platforms even when multiple entries share the same identifier', () => {
    const cards = mapRegisteredPlatformsToHomepageCards([
      {
        id: 'rp-opencti-configured-1',
        identifier: ServiceDefinitionIdentifier.OpenctiRegistration,
        title: 'OpenCTI Configured Platform 1',
        contract: PlatformContractEnum.CE,
        deployment_request: null,
        subscription: {
          start_date: '2025-12-01T00:00:00.000Z',
          end_date: null,
          service_instance: {
            id: 'si-opencti-1',
          },
        },
      },
      {
        id: 'rp-opencti-configured-2',
        identifier: ServiceDefinitionIdentifier.OpenctiRegistration,
        title: 'OpenCTI Configured Platform 2',
        contract: PlatformContractEnum.EE,
        deployment_request: null,
        subscription: {
          start_date: '2025-12-02T00:00:00.000Z',
          end_date: null,
          service_instance: {
            id: 'si-opencti-2',
          },
        },
      },
    ] as Parameters<typeof mapRegisteredPlatformsToHomepageCards>[0]);

    expect(cards).toEqual([
      {
        id: 'rp-opencti-configured-1',
        product: 'opencti',
        title: 'OpenCTI Configured Platform 1',
        registrationDate: '2025-12-01T00:00:00.000Z',
        contract: PlatformContractEnum.CE,
        remainingTrialDays: undefined,
      },
      {
        id: 'rp-opencti-configured-2',
        product: 'opencti',
        title: 'OpenCTI Configured Platform 2',
        registrationDate: '2025-12-02T00:00:00.000Z',
        contract: PlatformContractEnum.EE,
        remainingTrialDays: undefined,
      },
    ]);
  });

  it('includes request-only entries when no configured platform exists for the identifier', () => {
    const cards = mapRegisteredPlatformsToHomepageCards([
      {
        id: 'rp-request-opencti',
        identifier: ServiceDefinitionIdentifier.OpenctiRegistration,
        title: 'OpenCTI Requested Platform',
        contract: PlatformContractEnum.TRIAL,
        deployment_request: {
          id: 'dr-opencti',
          hub_status: DeploymentRequestHubStatus.Pending,
          request_date: '2025-12-20T00:00:00.000Z',
          start_date: null,
          end_date: '2026-01-10T00:00:00.000Z',
        },
        subscription: {
          start_date: null,
          end_date: null,
          service_instance: null,
        },
      },
    ] as Parameters<typeof mapRegisteredPlatformsToHomepageCards>[0]);

    expect(cards).toEqual([
      {
        id: 'rp-request-opencti',
        product: 'opencti',
        title: 'OpenCTI Requested Platform',
        registrationDate: '2025-12-20T00:00:00.000Z',
        contract: PlatformContractEnum.TRIAL,
        remainingTrialDays: 9,
      },
    ]);
  });

  it('excludes request-only entries when request status is cancelled', () => {
    const cards = mapRegisteredPlatformsToHomepageCards([
      {
        id: 'rp-request-cancelled',
        identifier: ServiceDefinitionIdentifier.OpenaevRegistration,
        title: 'OpenAEV Cancelled Request',
        contract: PlatformContractEnum.TRIAL,
        deployment_request: {
          id: 'dr-openaev',
          hub_status: DeploymentRequestHubStatus.Cancelled,
          request_date: '2025-12-21T00:00:00.000Z',
          start_date: null,
          end_date: '2026-01-12T00:00:00.000Z',
        },
        subscription: {
          start_date: null,
          end_date: null,
          service_instance: null,
        },
      },
    ] as Parameters<typeof mapRegisteredPlatformsToHomepageCards>[0]);

    expect(cards).toEqual([]);
  });

  it('prefers the most recent request-only candidate when multiple exist for the same identifier', () => {
    const cards = mapRegisteredPlatformsToHomepageCards([
      {
        id: 'rp-request-opencti-older',
        identifier: ServiceDefinitionIdentifier.OpenctiRegistration,
        title: 'OpenCTI Requested Older Platform',
        contract: PlatformContractEnum.TRIAL,
        deployment_request: {
          id: 'dr-opencti-older',
          hub_status: DeploymentRequestHubStatus.Pending,
          request_date: '2025-12-20T00:00:00.000Z',
          start_date: null,
          end_date: '2026-01-10T00:00:00.000Z',
        },
        subscription: {
          start_date: null,
          end_date: null,
          service_instance: null,
        },
      },
      {
        id: 'rp-request-opencti-newer',
        identifier: ServiceDefinitionIdentifier.OpenctiRegistration,
        title: 'OpenCTI Requested Newer Platform',
        contract: PlatformContractEnum.TRIAL,
        deployment_request: {
          id: 'dr-opencti-newer',
          hub_status: DeploymentRequestHubStatus.Queued,
          request_date: '2025-12-25T00:00:00.000Z',
          start_date: null,
          end_date: '2026-01-15T00:00:00.000Z',
        },
        subscription: {
          start_date: null,
          end_date: null,
          service_instance: null,
        },
      },
    ] as Parameters<typeof mapRegisteredPlatformsToHomepageCards>[0]);

    expect(cards).toEqual([
      {
        id: 'rp-request-opencti-newer',
        product: 'opencti',
        title: 'OpenCTI Requested Newer Platform',
        registrationDate: '2025-12-25T00:00:00.000Z',
        contract: PlatformContractEnum.TRIAL,
        remainingTrialDays: 14,
      },
    ]);
  });

  it('prefers configured registered platform over request-only entry for the same service identifier', () => {
    const cards = mapRegisteredPlatformsToHomepageCards([
      {
        id: 'rp-opencti-configured',
        identifier: ServiceDefinitionIdentifier.OpenctiRegistration,
        title: 'OpenCTI Configured Platform',
        contract: PlatformContractEnum.EE,
        deployment_request: {
          id: 'dr-opencti-previous',
          hub_status: DeploymentRequestHubStatus.Active,
          request_date: '2025-11-20T00:00:00.000Z',
          start_date: '2025-11-25T00:00:00.000Z',
          end_date: null,
        },
        subscription: {
          start_date: '2025-12-01T00:00:00.000Z',
          end_date: null,
          service_instance: {
            id: 'si-opencti',
          },
        },
      },
      {
        id: 'rp-opencti-request-only',
        identifier: ServiceDefinitionIdentifier.OpenctiRegistration,
        title: 'OpenCTI Requested Platform',
        contract: PlatformContractEnum.TRIAL,
        deployment_request: {
          id: 'dr-opencti-request-only',
          hub_status: DeploymentRequestHubStatus.Queued,
          request_date: '2025-12-25T00:00:00.000Z',
          start_date: null,
          end_date: '2026-01-15T00:00:00.000Z',
        },
        subscription: {
          start_date: null,
          end_date: null,
          service_instance: null,
        },
      },
    ] as Parameters<typeof mapRegisteredPlatformsToHomepageCards>[0]);

    expect(cards).toEqual([
      {
        id: 'rp-opencti-configured',
        product: 'opencti',
        title: 'OpenCTI Configured Platform',
        registrationDate: '2025-12-01T00:00:00.000Z',
        contract: PlatformContractEnum.EE,
        remainingTrialDays: undefined,
      },
    ]);
  });

  it('deduplicates configured entries when the same configured platform appears multiple times', () => {
    const cards = mapRegisteredPlatformsToHomepageCards([
      {
        id: 'rp-opencti-configured-active',
        identifier: ServiceDefinitionIdentifier.OpenctiRegistration,
        title: 'OpenCTI Trial Platform',
        contract: PlatformContractEnum.TRIAL,
        deployment_request: {
          id: 'dr-opencti-active',
          hub_status: DeploymentRequestHubStatus.Active,
          request_date: '2025-12-20T00:00:00.000Z',
          start_date: '2025-12-21T00:00:00.000Z',
          end_date: '2026-01-10T00:00:00.000Z',
        },
        subscription: {
          start_date: '2025-12-22T00:00:00.000Z',
          end_date: '2026-01-10T00:00:00.000Z',
          service_instance: {
            id: 'si-opencti-trial',
          },
        },
      },
      {
        id: 'rp-opencti-configured-trial',
        identifier: ServiceDefinitionIdentifier.OpenctiRegistration,
        title: 'OpenCTI Trial Platform',
        contract: PlatformContractEnum.TRIAL,
        deployment_request: {
          id: 'dr-opencti-active',
          hub_status: DeploymentRequestHubStatus.Active,
          request_date: '2025-12-20T00:00:00.000Z',
          start_date: '2025-12-21T00:00:00.000Z',
          end_date: '2026-01-10T00:00:00.000Z',
        },
        subscription: {
          start_date: '2025-12-22T00:00:00.000Z',
          end_date: '2026-01-10T00:00:00.000Z',
          service_instance: {
            id: 'si-opencti-trial',
          },
        },
      },
    ] as Parameters<typeof mapRegisteredPlatformsToHomepageCards>[0]);

    expect(cards).toEqual([
      {
        id: 'rp-opencti-configured-active',
        product: 'opencti',
        title: 'OpenCTI Trial Platform',
        registrationDate: '2025-12-22T00:00:00.000Z',
        contract: PlatformContractEnum.TRIAL,
        remainingTrialDays: 9,
      },
    ]);
  });
});

describe('findLogoUrl', () => {
  it.each`
    children_documents                                          | service_instance_id | expected                        | description
    ${null}                                                     | ${'inst-1'}         | ${undefined}                    | ${'returns undefined when children_documents is null'}
    ${[{ id: 'd1', image_type: DocumentImageType.Screenshot }]} | ${'inst-1'}         | ${undefined}                    | ${'returns undefined when no child has Logo image type'}
    ${[{ id: 'd1', image_type: DocumentImageType.Logo }]}       | ${null}             | ${undefined}                    | ${'returns undefined when logo is present but service_instance_id is null'}
    ${[{ id: 'd1', image_type: DocumentImageType.Logo }]}       | ${'inst-1'}         | ${'/document/images/inst-1/d1'} | ${'returns the image URL when logo and service_instance_id are both present'}
  `(
    '$description',
    ({
      children_documents,
      service_instance_id,
      expected,
    }: {
      children_documents:
        { id: string; image_type: DocumentImageType }[] | null;
      service_instance_id: string | null;
      expected: string | undefined;
    }) => {
      const resource = {
        id: 'res-1',
        name: 'Resource',
        type: 'opencti_custom_dashboard',
        active: true,
        slug: 'resource-slug',
        short_description: null,
        service_instance_id,
        children_documents,
        use_cases: null,
      };
      expect(findLogoUrl(resource as Parameters<typeof findLogoUrl>[0])).toBe(
        expected
      );
    }
  );
});

describe('resolveHomepageRoadmapResolution', () => {
  it.each`
    identifiers                                                                                           | expected                                                                   | description
    ${[]}                                                                                                 | ${{ productFilter: undefined, titleProduct: 'default' }}                   | ${'returns default roadmap resolution for an empty array'}
    ${[ServiceDefinitionIdentifier.OpenaevRegistration]}                                                  | ${{ productFilter: FiligranProductEnum.OPENAEV, titleProduct: 'openaev' }} | ${'returns OAEV roadmap resolution for OAEV-only identifiers'}
    ${[ServiceDefinitionIdentifier.OpenctiRegistration]}                                                  | ${{ productFilter: FiligranProductEnum.OPENCTI, titleProduct: 'opencti' }} | ${'returns OCTI roadmap resolution for OCTI-only identifiers'}
    ${[ServiceDefinitionIdentifier.OpenctiRegistration, ServiceDefinitionIdentifier.OpenaevRegistration]} | ${{ productFilter: undefined, titleProduct: 'default' }}                   | ${'returns default roadmap resolution when both platforms are registered'}
  `('$description', ({ identifiers, expected }) => {
    expect(resolveHomepageRoadmapResolution(identifiers)).toEqual(expected);
  });
});

describe('resolveDeployFirstResourceCtaTarget', () => {
  const serviceInstanceIdByDefinition = {
    [ServiceDefinitionIdentifier.OpenctiIntegrations]: 'svc-integrations',
    [ServiceDefinitionIdentifier.OpenctiCustomDashboards]:
      'svc-custom-dashboards',
    [ServiceDefinitionIdentifier.OpenctiPlaybooks]: 'svc-playbooks',
    [ServiceDefinitionIdentifier.OpenctiCustomViews]: 'svc-custom-views',
    [ServiceDefinitionIdentifier.OpenaevScenarios]: 'svc-scenarios',
  };

  it('prioritizes OpenCTI integration over all other undeployed resource types', () => {
    const ctaTarget = resolveDeployFirstResourceCtaTarget(
      [
        {
          product: PlatformIdentifier.Opencti,
          resourceTypes: [
            DeployableResourceType.CustomViews,
            DeployableResourceType.Integrations,
            DeployableResourceType.Playbooks,
          ],
        },
        {
          product: PlatformIdentifier.Openaev,
          resourceTypes: [DeployableResourceType.Scenarios],
        },
      ],
      serviceInstanceIdByDefinition
    );

    expect(ctaTarget).toEqual({
      href: '/app/service/opencti_integrations/svc-integrations',
      resourceType: DeployableResourceType.Integrations,
    });
  });

  it('falls back to OpenAEV scenario when no OpenCTI undeployed type is available', () => {
    const ctaTarget = resolveDeployFirstResourceCtaTarget(
      [
        {
          product: PlatformIdentifier.Openaev,
          resourceTypes: [DeployableResourceType.Scenarios],
        },
      ],
      serviceInstanceIdByDefinition
    );

    expect(ctaTarget).toEqual({
      href: '/app/service/openaev_scenarios/svc-scenarios',
      resourceType: DeployableResourceType.Scenarios,
    });
  });

  it('returns undefined when there is no undeployed resource type', () => {
    expect(
      resolveDeployFirstResourceCtaTarget([], serviceInstanceIdByDefinition)
    ).toBeUndefined();
  });

  it('returns undefined when service instance id is missing', () => {
    const ctaTarget = resolveDeployFirstResourceCtaTarget(
      [
        {
          product: PlatformIdentifier.Opencti,
          resourceTypes: [DeployableResourceType.CustomDashboards],
        },
      ],
      {}
    );

    expect(ctaTarget).toBeUndefined();
  });
});

describe('resolveHomepageCrossSellProductFromCards', () => {
  it.each`
    cards                                                                                                                                                                                                                                                                                         | expected                          | description
    ${[]}                                                                                                                                                                                                                                                                                         | ${undefined}                      | ${'returns undefined when no cards are visible'}
    ${[{ id: '1', product: 'opencti', title: 'OpenCTI', registrationDate: null, contract: PlatformContractEnum.CE, remainingTrialDays: undefined }]}                                                                                                                                              | ${PlatformIdentifierEnum.OPENAEV} | ${'returns OpenAEV when only an OpenCTI card is visible'}
    ${[{ id: '1', product: 'openaev', title: 'OpenAEV', registrationDate: null, contract: PlatformContractEnum.CE, remainingTrialDays: undefined }]}                                                                                                                                              | ${PlatformIdentifierEnum.OPENCTI} | ${'returns OpenCTI when only an OpenAEV card is visible'}
    ${[{ id: '1', product: 'opencti', title: 'OpenCTI', registrationDate: null, contract: PlatformContractEnum.CE, remainingTrialDays: undefined }, { id: '2', product: 'openaev', title: 'OpenAEV', registrationDate: null, contract: PlatformContractEnum.CE, remainingTrialDays: undefined }]} | ${undefined}                      | ${'returns undefined when cards are visible for both products'}
  `('$description', ({ cards, expected }) => {
    expect(resolveHomepageCrossSellProduct(cards)).toBe(expected);
  });
});
