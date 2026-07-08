export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type addPrefixToObject<T, P extends string> = {
  [K in keyof T as K extends string ? `${P}${K}` : never]: T[K];
};

export const stripNulls = <T extends object>(
  obj: T
): {
  [K in keyof T]: null extends T[K] ? Exclude<T[K], null> | undefined : T[K];
} =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== null)) as {
    [K in keyof T]: null extends T[K] ? Exclude<T[K], null> | undefined : T[K];
  };

/**
 * Runs `mapper` over `items` with at most `concurrency` invocations in
 * flight at any time, instead of the unbounded concurrency of
 * `Promise.all(items.map(mapper))`. Useful when `items` can be large and
 * `mapper` performs I/O (DB calls, HTTP requests, etc.) that would
 * otherwise exhaust a shared connection/socket pool if run all at once.
 *
 * Results are returned in the same order as `items`, regardless of
 * completion order.
 */
export const mapWithConcurrency = async <T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>
): Promise<R[]> => {
  const results: R[] = new Array(items.length);
  const iterator = items.entries();

  const runWorker = async (): Promise<void> => {
    for (const [index, item] of iterator) {
      results[index] = await mapper(item);
    }
  };

  const workers = Array.from(
    { length: Math.min(Math.max(concurrency, 1), items.length) },
    runWorker
  );
  await Promise.all(workers);

  return results;
};
