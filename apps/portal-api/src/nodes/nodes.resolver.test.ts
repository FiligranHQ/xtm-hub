import { toGlobalId } from 'graphql-relay/node/node.js';
import { v4 as uuidv4 } from 'uuid';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { contextSimpleUserFiligran2, INFO } from '../../tests/tests.const';
import { ErrorType } from '../utils/error/error.type';
import nodesResolver from './nodes.resolver';

vi.mock('../../knexfile', () => ({
  db: vi.fn(),
}));

import { db } from '../../knexfile';

describe('query.node', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should throw UNAUTHENTICATED when no user is present in context', async () => {
    const call = nodesResolver.Query!.node!(
      {},
      { id: toGlobalId('Organization', uuidv4()) },
      {} as never,
      INFO
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
    vi.mocked(db).mockReturnValue({ where: whereMock } as never);

    const result = await nodesResolver.Query!.node!(
      {},
      { id: toGlobalId('Organization', rawId) },
      contextSimpleUserFiligran2,
      INFO
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
      } as never;
      const result = nodesResolver.Node!.id!(
        node,
        {},
        contextSimpleUserFiligran2,
        INFO
      );
      expect(result).toBe(toGlobalId('Organization', node.id));
    });
  });

  describe('node.__resolveType', () => {
    it('should return the __typename of the node', () => {
      const node = { id: uuidv4(), __typename: 'ServiceInstance' } as never;
      const result = (nodesResolver.Node as never).__resolveType(node);
      expect(result).toBe('ServiceInstance');
    });
  });
});
