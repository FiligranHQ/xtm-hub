/**
 * Runs `fn` `iterations` times and returns the average wall-clock duration in
 * milliseconds, measured with `performance.now()`.
 */
export async function measureAvgDuration(
  fn: () => Promise<unknown>,
  iterations = 10
): Promise<number> {
  let total = 0;
  for (let i = 0; i < iterations; i++) {
    const t0 = performance.now();
    await fn();
    total += performance.now() - t0;
  }
  return total / iterations;
}
