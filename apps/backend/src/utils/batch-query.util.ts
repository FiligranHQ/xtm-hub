const TUPLE_SEPARATOR = '\u0000';

// Batch queries match on tuples (`WHERE (a, b) IN ((..), (..))`) to keep the
// correlation between columns; duplicated tuples would only bloat the query.
export const uniqueTuples = <Value extends string>(
  tuples: readonly Value[][]
): Value[][] => {
  const seen = new Set<string>();

  return tuples.filter((tuple) => {
    const identifier = tuple.join(TUPLE_SEPARATOR);
    if (seen.has(identifier)) {
      return false;
    }

    seen.add(identifier);
    return true;
  });
};

export interface TupleColumn<Key> {
  // Column reference passed to knex's `whereIn`, e.g. `Subscription.organization_id`.
  column: string;
  // Extracts the value matching this column from a batch key.
  value: (key: Key) => string;
}

export interface TupleFilter {
  columns: string[];
  tuples: string[][];
}

// Pairs each column with its value extractor so the columns array passed to
// `whereIn` and the tuples built from the keys can never drift out of order,
// which would otherwise silently match the cross product of the columns.
export const buildTupleFilter = <Key>(
  keys: readonly Key[],
  columns: readonly TupleColumn<Key>[]
): TupleFilter => ({
  columns: columns.map(({ column }) => column),
  tuples: uniqueTuples(
    keys.map((key) => columns.map(({ value }) => value(key)))
  ),
});
