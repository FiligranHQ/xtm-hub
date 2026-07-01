import { FiligranProductEnum } from '@generated/models/FiligranProduct.enum';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import {
  DocumentImageType,
  ServiceDefinitionIdentifier,
} from '@graphql/generated';
import { describe, expect, it } from 'vitest';
import {
  findLogoUrl,
  resolveHomepagePlatformIdentifiers,
  resolveHomepageRoadmapResolution,
} from './Homepage.utils';

describe('resolveHomepagePlatformIdentifiers', () => {
  it.each([
    {
      identifiers: [],
      expected: undefined,
      description: 'returns undefined for an empty array',
    },
    {
      identifiers: [ServiceDefinitionIdentifier.OpenctiRegistration],
      expected: [PlatformIdentifierEnum.OPENCTI],
      description: 'returns [OPENCTI] for a single OPENCTI identifier',
    },
    {
      identifiers: [ServiceDefinitionIdentifier.OpenaevRegistration],
      expected: [PlatformIdentifierEnum.OPENAEV],
      description: 'returns [OPENAEV] for a single OPENAEV identifier',
    },
    {
      identifiers: [
        ServiceDefinitionIdentifier.OpenctiRegistration,
        ServiceDefinitionIdentifier.OpenctiRegistration,
      ],
      expected: [PlatformIdentifierEnum.OPENCTI],
      description:
        'returns [OPENCTI] when duplicate identifiers resolve to the same platform',
    },
    {
      identifiers: [
        ServiceDefinitionIdentifier.OpenctiRegistration,
        ServiceDefinitionIdentifier.OpenaevRegistration,
      ],
      expected: undefined,
      description:
        'returns undefined when identifiers span two different platforms',
    },
    {
      identifiers: [ServiceDefinitionIdentifier.Vault],
      expected: undefined,
      description: 'returns undefined for an unmapped identifier',
    },
  ])('$description', ({ identifiers, expected }) => {
    expect(resolveHomepagePlatformIdentifiers(identifiers)).toEqual(expected);
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
  ])(
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
  it.each([
    {
      identifiers: [],
      expected: {
        productFilter: undefined,
        titleKey: 'Title',
      },
      description: 'returns default roadmap resolution for an empty array',
    },
    {
      identifiers: [ServiceDefinitionIdentifier.OpenaevRegistration],
      expected: {
        productFilter: FiligranProductEnum.OPENAEV,
        titleKey: 'OpenAEVTitle',
      },
      description: 'returns OAEV roadmap resolution for OAEV-only identifiers',
    },
    {
      identifiers: [ServiceDefinitionIdentifier.OpenctiRegistration],
      expected: {
        productFilter: FiligranProductEnum.OPENCTI,
        titleKey: 'OpenCTITitle',
      },
      description: 'returns OCTI roadmap resolution for OCTI-only identifiers',
    },
    {
      identifiers: [
        ServiceDefinitionIdentifier.OpenctiRegistration,
        ServiceDefinitionIdentifier.OpenaevRegistration,
      ],
      expected: {
        productFilter: undefined,
        titleKey: 'Title',
      },
      description:
        'returns default roadmap resolution when both platforms are registered',
    },
  ])('$description', ({ identifiers, expected }) => {
    expect(resolveHomepageRoadmapResolution(identifiers)).toEqual(expected);
  });
});
