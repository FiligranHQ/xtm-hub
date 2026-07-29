import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FiligranProduct } from '../../__generated__/resolvers-types';
import { solutionCategoryDomain } from './solution-category.domain';

vi.mock('../../../knexfile', () => ({
  db: vi.fn(),
  paginate: vi.fn(),
}));

import { db, paginate } from '../../../knexfile';

describe('solution-category.domain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loadSolutionCategories', () => {
    it('should apply product filter when product is provided', async () => {
      // Given
      const andWhereRawMock = vi.fn();
      const queryMock = { query: 'solution-category-query' };
      const modifyMock = vi
        .fn()
        .mockImplementation(
          (
            callback: (queryBuilder: {
              andWhereRaw: typeof andWhereRawMock;
            }) => void
          ) => {
            callback({ andWhereRaw: andWhereRawMock });
            return queryMock;
          }
        );
      const expected = {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
        totalCount: 0,
      };
      vi.mocked(db).mockReturnValue({
        modify: modifyMock,
      } as unknown as ReturnType<typeof db>);
      vi.mocked(paginate).mockResolvedValue(
        expected as Awaited<
          ReturnType<typeof solutionCategoryDomain.loadSolutionCategories>
        >
      );
      const opts = {
        first: 10,
        product: FiligranProduct.Opencti,
      };

      // When
      const result = await solutionCategoryDomain.loadSolutionCategories(opts);

      // Then
      expect(db).toHaveBeenCalledWith('SolutionCategory');
      expect(andWhereRawMock).toHaveBeenCalledWith(
        '"SolutionCategory"."product"::text[] @> ARRAY[?]::text[]',
        [FiligranProduct.Opencti]
      );
      expect(paginate).toHaveBeenCalledWith(
        'SolutionCategory',
        opts,
        undefined,
        queryMock
      );
      expect(result).toEqual(expected);
    });

    it('should not apply product filter when product is not provided', async () => {
      // Given
      const andWhereRawMock = vi.fn();
      const queryMock = { query: 'solution-category-query' };
      const modifyMock = vi
        .fn()
        .mockImplementation(
          (
            callback: (queryBuilder: {
              andWhereRaw: typeof andWhereRawMock;
            }) => void
          ) => {
            callback({ andWhereRaw: andWhereRawMock });
            return queryMock;
          }
        );
      const expected = {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
        totalCount: 0,
      };
      vi.mocked(db).mockReturnValue({
        modify: modifyMock,
      } as unknown as ReturnType<typeof db>);
      vi.mocked(paginate).mockResolvedValue(
        expected as Awaited<
          ReturnType<typeof solutionCategoryDomain.loadSolutionCategories>
        >
      );
      const opts = { first: 10 };

      // When
      const result = await solutionCategoryDomain.loadSolutionCategories(opts);

      // Then
      expect(db).toHaveBeenCalledWith('SolutionCategory');
      expect(andWhereRawMock).not.toHaveBeenCalled();
      expect(paginate).toHaveBeenCalledWith(
        'SolutionCategory',
        opts,
        undefined,
        queryMock
      );
      expect(result).toEqual(expected);
    });
  });

  describe('buildSolutionCategoriesByDocumentIdQuery', () => {
    it('should build query joining Object_SolutionCategory and filtering on document ids', () => {
      // Given
      const documentIds = ['doc-1', 'doc-2'];
      const selectResult = { query: 'solution-categories-by-document' };
      const selectMock = vi.fn().mockReturnValue(selectResult);
      const whereInMock = vi.fn().mockReturnValue({
        select: selectMock,
      });
      const leftJoinMock = vi.fn().mockReturnValue({
        whereIn: whereInMock,
      });

      vi.mocked(db).mockReturnValue({
        leftJoin: leftJoinMock,
      } as unknown as ReturnType<typeof db>);

      // When
      const result =
        solutionCategoryDomain.buildSolutionCategoriesByDocumentIdQuery(
          documentIds
        );

      // Then
      expect(db).toHaveBeenCalledWith('SolutionCategory');
      expect(leftJoinMock).toHaveBeenCalledWith(
        'Object_SolutionCategory as osc',
        'osc.solution_category_id',
        'SolutionCategory.id'
      );
      expect(whereInMock).toHaveBeenCalledWith('osc.object_id', documentIds);
      expect(selectMock).toHaveBeenCalledWith(
        'SolutionCategory.*',
        'osc.object_id as _document_id'
      );
      expect(result).toBe(selectResult);
    });
  });
});
