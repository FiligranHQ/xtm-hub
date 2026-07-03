import { FiligranProductEnum } from '@generated/models/FiligranProduct.enum';
import { PlatformContractEnum } from '@generated/models/PlatformContract.enum';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import {
  DocumentImageType,
  ServiceDefinitionIdentifier,
} from '@graphql/generated';
import { describe, expect, it } from 'vitest';
import {
  findLogoUrl,
  mapRegisteredPlatformsToHomepageCards,
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

  it.each`
    endDate                       | expected     | description
    ${null}                       | ${undefined} | ${'returns undefined when end date is missing'}
    ${'2026-01-05T00:00:00.000Z'} | ${4}         | ${'returns rounded remaining days for future trial end date'}
    ${'2025-12-30T00:00:00.000Z'} | ${0}         | ${'returns zero when trial end date is already passed'}
  `('$description', ({ endDate, expected }) => {
    expect(resolveRemainingTrialDays(endDate, now)).toBe(expected);
  });
});

describe('mapRegisteredPlatformsToHomepageCards', () => {
  it('maps registered platforms to homepage cards and resolves deploy hrefs', () => {
    const now = new Date('2026-01-01T00:00:00.000Z');

    const cards = mapRegisteredPlatformsToHomepageCards(
      [
        {
          id: 'rp-1',
          identifier: ServiceDefinitionIdentifier.OpenctiRegistration,
          title: 'OpenCTI Platform',
          contract: PlatformContractEnum.CE,
          subscription: {
            start_date: '2025-12-01T00:00:00.000Z',
            end_date: null,
          },
        },
        {
          id: 'rp-2',
          identifier: ServiceDefinitionIdentifier.OpenaevRegistration,
          title: 'OpenAEV Trial Platform',
          contract: PlatformContractEnum.TRIAL,
          subscription: {
            start_date: '2025-12-15T00:00:00.000Z',
            end_date: '2026-01-03T00:00:00.000Z',
          },
        },
      ] as Parameters<typeof mapRegisteredPlatformsToHomepageCards>[0],
      {
        [ServiceDefinitionIdentifier.OpenctiRegistration]:
          '/app/service/opencti_integrations/service-1',
      },
      now
    );

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
});

describe('resolveHomepageCrossSellProduct', () => {
  it.each`
    identifiers                                                                                           | expected                          | description
    ${[]}                                                                                                 | ${undefined}                      | ${'returns undefined when no platform is registered'}
    ${[ServiceDefinitionIdentifier.OpenctiRegistration]}                                                  | ${PlatformIdentifierEnum.OPENAEV} | ${'returns OpenAEV when only OpenCTI is registered'}
    ${[ServiceDefinitionIdentifier.OpenaevRegistration]}                                                  | ${PlatformIdentifierEnum.OPENCTI} | ${'returns OpenCTI when only OpenAEV is registered'}
    ${[ServiceDefinitionIdentifier.OpenctiRegistration, ServiceDefinitionIdentifier.OpenaevRegistration]} | ${undefined}                      | ${'returns undefined when both product types are registered'}
  `('$description', ({ identifiers, expected }) => {
    expect(resolveHomepageCrossSellProduct(identifiers)).toBe(expected);
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
