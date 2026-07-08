import { PlatformContractEnum } from '@generated/models/PlatformContract.enum';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import {
  DocumentImageType,
  PlatformContract,
  PlatformIdentifier,
  ServiceDefinitionIdentifier,
} from '@graphql/generated';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildDistinctPlatformIdentifiersFromServiceDefinition,
  findLogoUrl,
  mapRegisteredPlatformsToHomepageCards,
  resolveHomepageCrossSellProduct,
  resolveRemainingTrialDays,
} from './Homepage.utils';

describe('buildDistinctPlatformIdentifiersFromServiceDefinition', () => {
  it.each`
    identifiers                                                                                                                           | expected                                                    | description
    ${[]}                                                                                                                                 | ${[]}                                                       | ${'returns an empty array for an empty array'}
    ${[{ identifier: ServiceDefinitionIdentifier.OpenctiRegistration }]}                                                                  | ${[PlatformIdentifier.Opencti]}                             | ${'returns [opencti] for a single OPENCTI identifier'}
    ${[{ identifier: ServiceDefinitionIdentifier.OpenaevRegistration }]}                                                                  | ${[PlatformIdentifier.Openaev]}                             | ${'returns [openaev] for a single OPENAEV identifier'}
    ${[{ identifier: ServiceDefinitionIdentifier.OpenctiRegistration }, { identifier: ServiceDefinitionIdentifier.OpenctiRegistration }]} | ${[PlatformIdentifier.Opencti]}                             | ${'deduplicates identifiers resolving to the same platform'}
    ${[{ identifier: ServiceDefinitionIdentifier.OpenctiRegistration }, { identifier: ServiceDefinitionIdentifier.OpenaevRegistration }]} | ${[PlatformIdentifier.Opencti, PlatformIdentifier.Openaev]} | ${'returns both platforms when identifiers span two different platforms'}
    ${[{ identifier: ServiceDefinitionIdentifier.Vault }]}                                                                                | ${[]}                                                       | ${'returns an empty array for an unmapped identifier'}
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

  it('maps registered platforms to homepage cards and resolves remaining trial days', () => {
    const cards = mapRegisteredPlatformsToHomepageCards([
      {
        id: 'rp-1',
        identifier: ServiceDefinitionIdentifier.OpenctiRegistration,
        title: 'OpenCTI Platform',
        contract: PlatformContract.Ce,
        subscription: {
          start_date: '2025-12-01T00:00:00.000Z',
          end_date: null,
        },
      },
      {
        id: 'rp-2',
        identifier: ServiceDefinitionIdentifier.OpenaevRegistration,
        title: 'OpenAEV Trial Platform',
        contract: PlatformContract.Trial,
        subscription: {
          start_date: '2025-12-15T00:00:00.000Z',
          end_date: '2026-01-03T00:00:00.000Z',
        },
      },
    ] as Parameters<typeof mapRegisteredPlatformsToHomepageCards>[0]);

    expect(cards).toEqual([
      {
        id: 'rp-1',
        platformIdentifier: PlatformIdentifier.Opencti,
        title: 'OpenCTI Platform',
        registrationDate: '2025-12-01T00:00:00.000Z',
        contract: PlatformContract.Ce,
        remainingTrialDays: undefined,
      },
      {
        id: 'rp-2',
        platformIdentifier: PlatformIdentifier.Openaev,
        title: 'OpenAEV Trial Platform',
        registrationDate: '2025-12-15T00:00:00.000Z',
        contract: PlatformContract.Trial,
        remainingTrialDays: 2,
      },
    ]);
  });

  it('excludes entries whose identifier does not resolve to a platform', () => {
    const cards = mapRegisteredPlatformsToHomepageCards([
      {
        id: 'rp-vault',
        identifier: ServiceDefinitionIdentifier.Vault,
        title: 'Vault',
        contract: PlatformContract.Ce,
        subscription: {
          start_date: '2025-12-01T00:00:00.000Z',
          end_date: null,
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
      },
      {
        id: 'rp-opencti-2',
        platformIdentifier: PlatformIdentifier.Opencti,
        title: 'OpenCTI Platform 2',
        registrationDate: '2025-12-02T00:00:00.000Z',
        contract: PlatformContract.Ee,
        remainingTrialDays: undefined,
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

describe('resolveHomepageCrossSellProduct', () => {
  it.each`
    cards                                                                                                                                                                                                                                                                                                                                                 | expected                          | description
    ${[]}                                                                                                                                                                                                                                                                                                                                                 | ${undefined}                      | ${'returns undefined when no cards are visible'}
    ${[{ id: '1', platformIdentifier: PlatformIdentifier.Opencti, title: 'OpenCTI', registrationDate: null, contract: PlatformContractEnum.CE, remainingTrialDays: undefined }]}                                                                                                                                                                          | ${PlatformIdentifierEnum.OPENAEV} | ${'returns OpenAEV when only an OpenCTI card is visible'}
    ${[{ id: '1', platformIdentifier: PlatformIdentifier.Openaev, title: 'OpenAEV', registrationDate: null, contract: PlatformContractEnum.CE, remainingTrialDays: undefined }]}                                                                                                                                                                          | ${PlatformIdentifierEnum.OPENCTI} | ${'returns OpenCTI when only an OpenAEV card is visible'}
    ${[{ id: '1', platformIdentifier: PlatformIdentifier.Opencti, title: 'OpenCTI', registrationDate: null, contract: PlatformContractEnum.CE, remainingTrialDays: undefined }, { id: '2', platformIdentifier: PlatformIdentifier.Openaev, title: 'OpenAEV', registrationDate: null, contract: PlatformContractEnum.CE, remainingTrialDays: undefined }]} | ${undefined}                      | ${'returns undefined when cards are visible for both products'}
  `('$description', ({ cards, expected }) => {
    expect(resolveHomepageCrossSellProduct(cards)).toBe(expected);
  });
});
