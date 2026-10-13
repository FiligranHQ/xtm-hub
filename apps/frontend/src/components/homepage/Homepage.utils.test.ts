import { XTM_PLATFORM_TRIAL_PATH } from '@/utils/path/constant';
import {
  DocumentImageType,
  PlatformContract,
  PlatformIdentifier,
  RegisteredPlatformsQuery,
  ServiceDefinitionIdentifier,
} from '@graphql/generated';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildDistinctPlatformIdentifiersFromServiceDefinition,
  findLogoUrl,
  mapRegisteredPlatformsToHomepageCards,
  resolveRemainingTrialDays,
} from './Homepage.utils';

const OPENCTI_REGISTERED_PLATFORM_ID = 'rp-1';
const OPENCTI_TITLE = 'OpenCTI Platform';
const OPENCTI_SERVICE_INSTANCE_ID = 'instance-1';
const OPENCTI_START_DATE = '2025-12-01T00:00:00.000Z';
const BUNDLE_PRODUCT_REGISTERED_PLATFORM_ID = 'rp-2';
const BUNDLE_PRODUCT_TITLE = 'OpenAEV Bundle Product';
const BUNDLE_DEPLOYMENT_REQUEST_ID = 'bundle-deployment-request-1';
const BUNDLE_PRODUCT_START_DATE = '2025-12-15T00:00:00.000Z';
const BUNDLE_PRODUCT_END_DATE = '2026-01-03T00:00:00.000Z';

describe('buildDistinctPlatformIdentifiersFromServiceDefinition', () => {
  it.each`
    identifiers                                                                                                                           | expected                                                    | description
    ${[]}                                                                                                                                 | ${[]}                                                       | ${'returns an empty array for an empty array'}
    ${[{ identifier: ServiceDefinitionIdentifier.OpenctiRegistration }]}                                                                  | ${[PlatformIdentifier.Opencti]}                             | ${'returns [opencti] for a single OPENCTI identifier'}
    ${[{ identifier: ServiceDefinitionIdentifier.OpenaevRegistration }]}                                                                  | ${[PlatformIdentifier.Openaev]}                             | ${'returns [openaev] for a single OPENAEV identifier'}
    ${[{ identifier: ServiceDefinitionIdentifier.OpenctiRegistration }, { identifier: ServiceDefinitionIdentifier.OpenctiRegistration }]} | ${[PlatformIdentifier.Opencti]}                             | ${'deduplicates identifiers resolving to the same platform'}
    ${[{ identifier: ServiceDefinitionIdentifier.OpenctiRegistration }, { identifier: ServiceDefinitionIdentifier.OpenaevRegistration }]} | ${[PlatformIdentifier.Opencti, PlatformIdentifier.Openaev]} | ${'returns both platforms when identifiers span two different platforms'}
    ${[{ identifier: ServiceDefinitionIdentifier.OpenctiIntegrations }]}                                                                  | ${[]}                                                       | ${'returns an empty array for an unmapped identifier'}
  `(
    '$description',
    ({
      identifiers,
      expected,
    }: {
      identifiers: Parameters<
        typeof buildDistinctPlatformIdentifiersFromServiceDefinition
      >[0];
      expected: PlatformIdentifier[];
    }) => {
      expect(
        buildDistinctPlatformIdentifiersFromServiceDefinition(identifiers)
      ).toEqual(expected);
    }
  );
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

  it.each([
    {
      endDate: null,
      expected: undefined,
      description: 'returns undefined when end date is missing',
    },
    {
      endDate: '2026-01-05T00:00:00.000Z',
      expected: 4,
      description: 'returns rounded remaining days for future trial end date',
    },
    {
      endDate: '2025-12-30T00:00:00.000Z',
      expected: 0,
      description: 'returns zero when trial end date is already passed',
    },
  ])('$description', ({ endDate, expected }) => {
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

  it('should map each platform to a card, linking bundle products to the XTM Platform trial page, when registered platforms resolve to a platform', () => {
    // Given
    const registeredPlatforms: RegisteredPlatformsQuery['registeredPlatforms'] =
      [
        {
          id: OPENCTI_REGISTERED_PLATFORM_ID,
          identifier: ServiceDefinitionIdentifier.OpenctiRegistration,
          title: OPENCTI_TITLE,
          contract: PlatformContract.Ce,
          deployment_request: null,
          subscription: {
            start_date: OPENCTI_START_DATE,
            end_date: null,
            service_instance_id: OPENCTI_SERVICE_INSTANCE_ID,
          },
        },
        {
          id: BUNDLE_PRODUCT_REGISTERED_PLATFORM_ID,
          identifier: ServiceDefinitionIdentifier.OpenaevRegistration,
          title: BUNDLE_PRODUCT_TITLE,
          contract: PlatformContract.Trial,
          deployment_request: { parent_id: BUNDLE_DEPLOYMENT_REQUEST_ID },
          subscription: {
            start_date: BUNDLE_PRODUCT_START_DATE,
            end_date: BUNDLE_PRODUCT_END_DATE,
            service_instance_id: 'instance-2',
          },
        },
      ];

    // When
    const cards = mapRegisteredPlatformsToHomepageCards(registeredPlatforms);

    // Then
    expect(cards).toEqual([
      {
        id: OPENCTI_REGISTERED_PLATFORM_ID,
        platformIdentifier: PlatformIdentifier.Opencti,
        title: OPENCTI_TITLE,
        registrationDate: OPENCTI_START_DATE,
        contract: PlatformContract.Ce,
        remainingTrialDays: undefined,
        href: `/app/service/opencti_registration/${OPENCTI_SERVICE_INSTANCE_ID}`,
      },
      {
        id: BUNDLE_PRODUCT_REGISTERED_PLATFORM_ID,
        platformIdentifier: PlatformIdentifier.Openaev,
        title: BUNDLE_PRODUCT_TITLE,
        registrationDate: BUNDLE_PRODUCT_START_DATE,
        contract: PlatformContract.Trial,
        remainingTrialDays: 2,
        href: XTM_PLATFORM_TRIAL_PATH,
      },
    ]);
  });

  it('excludes entries whose identifier does not resolve to a platform', () => {
    const cards = mapRegisteredPlatformsToHomepageCards([
      {
        id: 'rp-integrations',
        identifier: ServiceDefinitionIdentifier.OpenctiIntegrations,
        title: 'Integrations',
        contract: PlatformContract.Ce,
        subscription: {
          start_date: '2025-12-01T00:00:00.000Z',
          end_date: null,
          service_instance_id: 'instance-integrations',
        },
      },
    ] as Parameters<typeof mapRegisteredPlatformsToHomepageCards>[0]);

    expect(cards).toEqual([]);
  });

  it('returns all configured platforms even when multiple entries share the same identifier', () => {
    const cards = mapRegisteredPlatformsToHomepageCards([
      {
        id: 'rp-opencti-1',
        identifier: ServiceDefinitionIdentifier.OpenctiRegistration,
        title: 'OpenCTI Platform 1',
        contract: PlatformContract.Ce,
        subscription: {
          start_date: '2025-12-01T00:00:00.000Z',
          end_date: null,
          service_instance_id: 'instance-opencti-1',
        },
      },
      {
        id: 'rp-opencti-2',
        identifier: ServiceDefinitionIdentifier.OpenctiRegistration,
        title: 'OpenCTI Platform 2',
        contract: PlatformContract.Ee,
        subscription: {
          start_date: '2025-12-02T00:00:00.000Z',
          end_date: null,
          service_instance_id: 'instance-opencti-2',
        },
      },
    ] as Parameters<typeof mapRegisteredPlatformsToHomepageCards>[0]);

    expect(cards).toEqual([
      {
        id: 'rp-opencti-1',
        platformIdentifier: PlatformIdentifier.Opencti,
        title: 'OpenCTI Platform 1',
        registrationDate: '2025-12-01T00:00:00.000Z',
        contract: PlatformContract.Ce,
        remainingTrialDays: undefined,
        href: '/app/service/opencti_registration/instance-opencti-1',
      },
      {
        id: 'rp-opencti-2',
        platformIdentifier: PlatformIdentifier.Opencti,
        title: 'OpenCTI Platform 2',
        registrationDate: '2025-12-02T00:00:00.000Z',
        contract: PlatformContract.Ee,
        remainingTrialDays: undefined,
        href: '/app/service/opencti_registration/instance-opencti-2',
      },
    ]);
  });
});

describe('findLogoUrl', () => {
  it.each([
    {
      children_documents: null,
      service_instance_id: 'inst-1',
      expected: undefined,
      description: 'returns undefined when children_documents is null',
    },
    {
      children_documents: [
        { id: 'd1', image_type: DocumentImageType.Screenshot },
      ],
      service_instance_id: 'inst-1',
      expected: undefined,
      description: 'returns undefined when no child has Logo image type',
    },
    {
      children_documents: [{ id: 'd1', image_type: DocumentImageType.Logo }],
      service_instance_id: null,
      expected: undefined,
      description:
        'returns undefined when logo is present but service_instance_id is null',
    },
    {
      children_documents: [{ id: 'd1', image_type: DocumentImageType.Logo }],
      service_instance_id: 'inst-1',
      expected: '/document/images/inst-1/d1',
      description:
        'returns the image URL when logo and service_instance_id are both present',
    },
  ] as {
    children_documents: { id: string; image_type: DocumentImageType }[] | null;
    service_instance_id: string | null;
    expected: string | undefined;
    description: string;
  }[])(
    '$description',
    ({ children_documents, service_instance_id, expected }) => {
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
