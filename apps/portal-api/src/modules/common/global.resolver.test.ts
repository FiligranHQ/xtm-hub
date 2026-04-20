import { describe, expect, it } from 'vitest';
import globalResolver from './global.resolver';

describe('global.resolver', () => {
  it('should expose a non-null Upload scalar', () => {
    expect(globalResolver.Upload).toBeDefined();
    expect(globalResolver.Upload).not.toBeNull();
  });
});
