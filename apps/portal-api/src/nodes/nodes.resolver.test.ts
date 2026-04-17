import { toGlobalId } from 'graphql-relay/node/node.js';
import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it, vi } from 'vitest';
import {
  contextSimpleUserFiligran2,
  GRAPHQL_RESOLVE_INFO,
} from '../../tests/tests.const';
import { NodeResolvers } from '../__generated__/resolvers-types';
import { PortalContext } from '../model/portal-context';
import { ErrorType } from '../utils/error/error.type';
import nodesResolver from './nodes.resolver';

vi.mock('../../knexfile', () => ({
  db: vi.fn(),
}));

import { db } from '../../knexfile';

describe('node GraphQL query', () => {
  it('should throw UNAUTHENTICATED when no user is present in context', async () => {
    const call = nodesResolver.Query!.node!(
      {},
      { id: toGlobalId('Organization', uuidv4()) },
      {} as unknown as PortalContext,
      GRAPHQL_RESOLVE_INFO
    );

    await expect(call).rejects.toMatchObject({
      name: ErrorType.Unauthenticated,
    });
  });

  it('should decode the global ID and query the matching table', async () => {
    const rawId = uuidv4();
    const expected = { id: rawId, __typename: 'Organization' };
    const firstMock = vi.fn().mockResolvedValue(expected);
    const whereMock = vi.fn().mockReturnValue({ first: firstMock });
    vi.mocked(db).mockReturnValue({ where: whereMock } as unknown as ReturnType<
      typeof db
    >);

    const result = await nodesResolver.Query!.node!(
      {},
      { id: toGlobalId('Organization', rawId) },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    expect(db).toHaveBeenCalledWith('Organization');
    expect(whereMock).toHaveBeenCalledWith({ id: rawId });
    expect(result).toEqual(expected);
  });
});

describe('node type resolvers', () => {
  describe('node.id', () => {
    it('should encode id and __typename as a Relay global ID', () => {
      const node = {
        id: uuidv4(),
        __typename: 'Organization',
      } as unknown as Parameters<NonNullable<NodeResolvers['id']>>[0];
      const result = nodesResolver.Node!.id!(
        node,
        {},
        contextSimpleUserFiligran2,
        GRAPHQL_RESOLVE_INFO
      );
      expect(result).toBe(toGlobalId('Organization', node.id));
    });
  });

  describe('node.__resolveType', () => {
    it('should return the __typename of the node', () => {
      const node = {
        id: uuidv4(),
        __typename: 'ServiceInstance',
      } as unknown as Parameters<NonNullable<NodeResolvers['id']>>[0];
      const result = (nodesResolver.Node as unknown as NodeResolvers)
        .__resolveType!(node, contextSimpleUserFiligran2, GRAPHQL_RESOLVE_INFO);
      expect(result).toBe('ServiceInstance');
    });
  });
});
