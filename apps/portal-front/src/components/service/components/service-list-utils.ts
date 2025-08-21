import { useMemo } from 'react';
import { readInlineData } from 'react-relay';
import { GraphQLTaggedNode } from 'relay-runtime';
import { KeyType } from 'relay-runtime/lib/store/FragmentTypes';

export function useActiveAndDraftSplit<
  TFragmentData extends { active: boolean },
  TFragmentKey extends KeyType<TFragmentData>,
>(
  edges: ReadonlyArray<{ readonly node: TFragmentKey }> | undefined,
  fragment: GraphQLTaggedNode
): [TFragmentData[], TFragmentData[]] {
  return useMemo(() => {
    if (!edges) return [[], []];

    return edges.reduce<[TFragmentData[], TFragmentData[]]>(
      (acc, { node }) => {
        const item = readInlineData<TFragmentKey>(fragment, node);
        if ((item as TFragmentData).active) {
          acc[0].push(item as TFragmentData);
        } else {
          acc[1].push(item as TFragmentData);
        }
        return acc;
      },
      [[], []]
    );
  }, [edges, fragment]);
}
