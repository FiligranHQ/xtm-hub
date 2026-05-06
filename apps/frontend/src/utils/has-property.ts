export function hasProperty<T, K extends string | number | symbol, V = unknown>(
  obj: T,
  property: K
): obj is T & Record<K, V> {
  return obj != null && typeof obj === 'object' && property in obj;
}
