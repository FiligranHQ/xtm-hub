import type { UseCasesListQuery } from '@graphql/generated';
import { mockUseCase } from '@graphql/mocks';
import { describe, expect, it } from 'vitest';
import {
  prependToQueryCache,
  removeFromQueryCache,
  updateInQueryCache,
} from './query-cache';

const createUseCasesQuery = (
  ids: string[],
  totalCount = ids.length
): UseCasesListQuery => ({
  __typename: 'Query',
  useCases: {
    __typename: 'UseCaseConnection',
    totalCount,
    edges: ids.map((id) => ({
      __typename: 'UseCaseEdge',
      node: mockUseCase({ id, name: `name-${id}`, color: `#${id}${id}${id}` }),
    })),
  },
});

describe('query-cache utils', () => {
  describe('prependToQueryCache', () => {
    it('should prepend a new edge and increment totalCount', () => {
      const previous = createUseCasesQuery(['1', '2']);
      const next = prependToQueryCache<UseCasesListQuery, 'useCases'>(
        'useCases',
        {
          __typename: 'UseCaseEdge',
          node: mockUseCase({ id: '3', name: 'name-3', color: '#333' }),
        }
      )(previous);

      expect(next?.useCases?.totalCount).toBe(3);
      expect(next?.useCases?.edges[0]?.node.id).toBe('3');
      expect(next?.useCases?.edges.map((edge) => edge.node.id)).toEqual([
        '3',
        '1',
        '2',
      ]);
    });

    it.each`
      title                            | previous
      ${'undefined previous query'}    | ${undefined}
      ${'null connection in previous'} | ${{ __typename: 'Query', useCases: null }}
    `('should keep value unchanged for $title', ({ previous }) => {
      const next = prependToQueryCache<UseCasesListQuery, 'useCases'>(
        'useCases',
        {
          __typename: 'UseCaseEdge',
          node: mockUseCase({ id: '3', name: 'name-3', color: '#333' }),
        }
      )(previous as UseCasesListQuery | undefined);

      expect(next).toBe(previous);
    });
  });

  describe('updateInQueryCache', () => {
    it('should update the matching node by id', () => {
      const previous = createUseCasesQuery(['1', '2']);

      const next = updateInQueryCache<UseCasesListQuery, 'useCases'>(
        'useCases',
        {
          ...mockUseCase(),
          id: '2',
          name: 'updated-name-2',
          color: '#222222',
        }
      )(previous);

      expect(next?.useCases?.edges[0]?.node.name).toBe('name-1');
      expect(next?.useCases?.edges[1]?.node.name).toBe('updated-name-2');
      expect(next?.useCases?.totalCount).toBe(2);
    });
  });

  describe('removeFromQueryCache', () => {
    it('should remove the matching edge and decrement totalCount', () => {
      const previous = createUseCasesQuery(['1', '2', '3']);

      const next = removeFromQueryCache<UseCasesListQuery, 'useCases'>(
        'useCases',
        '2'
      )(previous);

      expect(next?.useCases?.totalCount).toBe(2);
      expect(next?.useCases?.edges.map((edge) => edge.node.id)).toEqual([
        '1',
        '3',
      ]);
    });

    it('should return previous value when deleted id is not found', () => {
      const previous = createUseCasesQuery(['1', '2']);

      const next = removeFromQueryCache<UseCasesListQuery, 'useCases'>(
        'useCases',
        '999'
      )(previous);

      expect(next).toBe(previous);
    });

    it('should keep totalCount >= 0 when removing last element', () => {
      const previous = createUseCasesQuery(['1'], 0);

      const next = removeFromQueryCache<UseCasesListQuery, 'useCases'>(
        'useCases',
        '1'
      )(previous);

      expect(next?.useCases?.totalCount).toBe(0);
      expect(next?.useCases?.edges).toEqual([]);
    });
  });
});
