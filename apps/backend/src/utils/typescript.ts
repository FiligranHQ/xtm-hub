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
