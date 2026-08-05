import { describe, expect, it } from 'vitest';
import { FiligranProduct } from '../../__generated__/resolvers-types';
import SolutionCategory, {
  SolutionCategoryId,
} from '../../model/kanel/public/SolutionCategory';
import {
  buildSolutionCategoryIndex,
  resolveSolutionCategoryNames,
} from './solution-category.utils';

const THREAT_INTEL_NAME = 'Threat Intelligence Feed';
const THREAT_INTEL_ID =
  'c1f4b0de-0000-4000-8000-000000000001' as SolutionCategoryId;
const EDR_NAME = 'Endpoint Detection & Response (EDR/XDR)';
const EDR_ID = 'c1f4b0de-0000-4000-8000-000000000002' as SolutionCategoryId;
const AI_SECURITY_NAME = 'AI Security';
const AI_SECURITY_ID =
  'c1f4b0de-0000-4000-8000-000000000003' as SolutionCategoryId;

const makeSolutionCategory = (
  overrides: Partial<SolutionCategory> = {}
): SolutionCategory =>
  ({
    id: THREAT_INTEL_ID,
    name: THREAT_INTEL_NAME,
    product: [FiligranProduct.Opencti],
    ...overrides,
  }) as SolutionCategory;

const OPENCTI_CATEGORIES = [
  makeSolutionCategory(),
  makeSolutionCategory({ id: EDR_ID, name: EDR_NAME }),
  makeSolutionCategory({ id: AI_SECURITY_ID, name: AI_SECURITY_NAME }),
];

describe('buildSolutionCategoryIndex', () => {
  it('should index a category when its product list contains the requested product', () => {
    // Given a category scoped to OpenCTI
    const categories = [makeSolutionCategory()];

    // When the index is built for OpenCTI
    const index = buildSolutionCategoryIndex(
      categories,
      FiligranProduct.Opencti
    );

    // Then the category is reachable
    expect(index.size).toBe(1);
  });

  it('should index a category shared by several products', () => {
    // Given a category scoped to both platforms
    const categories = [
      makeSolutionCategory({
        product: [FiligranProduct.Openaev, FiligranProduct.Opencti],
      }),
    ];

    // When the index is built for OpenCTI
    const index = buildSolutionCategoryIndex(
      categories,
      FiligranProduct.Opencti
    );

    // Then the category is reachable
    expect(index.size).toBe(1);
  });

  it('should exclude a category scoped to another product', () => {
    // Given a category scoped to OpenAEV only
    const categories = [
      makeSolutionCategory({ product: [FiligranProduct.Openaev] }),
    ];

    // When the index is built for OpenCTI
    const index = buildSolutionCategoryIndex(
      categories,
      FiligranProduct.Opencti
    );

    // Then it is not reachable
    expect(index.size).toBe(0);
  });

  it('should exclude a category whose product list is empty', () => {
    // Given a category created without any product, which the admin form allows
    const categories = [makeSolutionCategory({ product: [] })];

    // When the index is built for OpenCTI
    const index = buildSolutionCategoryIndex(
      categories,
      FiligranProduct.Opencti
    );

    // Then it is not reachable and will be reported as unknown at ingestion
    expect(index.size).toBe(0);
  });

  it('should keep the first occurrence when two categories share the same name', () => {
    // Given a referential with a duplicated name, which no DB constraint prevents
    const categories = [
      makeSolutionCategory({ id: THREAT_INTEL_ID }),
      makeSolutionCategory({ id: EDR_ID }),
    ];

    // When the index is built
    const index = buildSolutionCategoryIndex(
      categories,
      FiligranProduct.Opencti
    );

    // Then resolution is deterministic on the first row
    expect(Array.from(index.values())).toEqual([THREAT_INTEL_ID]);
  });
});

describe('resolveSolutionCategoryNames', () => {
  const index = buildSolutionCategoryIndex(
    OPENCTI_CATEGORIES,
    FiligranProduct.Opencti
  );

  it('should resolve known names to their category ids', () => {
    // Given two names present in the referential
    const names = [THREAT_INTEL_NAME, EDR_NAME];

    // When they are resolved
    const { resolved } = resolveSolutionCategoryNames(names, index);

    // Then both ids are returned
    expect(resolved).toEqual([THREAT_INTEL_ID, EDR_ID]);
  });

  it.each`
    name                              | description
    ${'threat intelligence feed'}     | ${'lower-cased'}
    ${'THREAT INTELLIGENCE FEED'}     | ${'upper-cased'}
    ${'  Threat Intelligence Feed  '} | ${'padded with whitespace'}
  `(
    'should resolve a name when it is $description',
    ({ name }: { name: string }) => {
      // Given a name that differs from the referential only by case or padding
      // When it is resolved
      const { resolved } = resolveSolutionCategoryNames([name], index);

      // Then it matches the stored category
      expect(resolved).toEqual([THREAT_INTEL_ID]);
    }
  );

  it('should link a category once when the same name is listed twice', () => {
    // Given a fragment repeating the same category
    const names = [THREAT_INTEL_NAME, THREAT_INTEL_NAME];

    // When the names are resolved
    const { resolved } = resolveSolutionCategoryNames(names, index);

    // Then a single id is returned, so the composite primary key is not violated
    expect(resolved).toEqual([THREAT_INTEL_ID]);
  });

  it('should report an unknown name and keep the known ones', () => {
    // Given a mix of a known and an unknown category
    const names = [THREAT_INTEL_NAME, 'Quantum Threat Divination'];

    // When the names are resolved
    const result = resolveSolutionCategoryNames(names, index);

    // Then the unknown one is reported instead of silently dropped
    expect(result).toEqual({
      resolved: [THREAT_INTEL_ID],
      unknown: ['Quantum Threat Divination'],
    });
  });

  it('should not match a name containing SQL wildcards', () => {
    // Given a name that would match through an ILIKE pattern
    const names = ['AI_Security'];

    // When it is resolved
    const { resolved, unknown } = resolveSolutionCategoryNames(names, index);

    // Then matching stays exact, unlike the ILIKE lookup used for use cases
    expect({ resolved, unknown }).toEqual({
      resolved: [],
      unknown: ['AI_Security'],
    });
  });

  it('should resolve nothing when the name list is empty', () => {
    // Given a fragment without solution categories
    // When the empty list is resolved
    const result = resolveSolutionCategoryNames([], index);

    // Then nothing is resolved and nothing is reported
    expect(result).toEqual({ resolved: [], unknown: [] });
  });
});
