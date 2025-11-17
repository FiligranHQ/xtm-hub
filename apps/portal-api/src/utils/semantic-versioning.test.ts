import { describe, expect, it } from 'vitest';
import { compareSemanticVersions } from './semantic-versioning';

describe('compareSemanticVersions', () => {
  it('should return 0 when versions are identical', () => {
    expect(compareSemanticVersions('1.2.3', '1.2.3')).toBe(0);
    expect(compareSemanticVersions('0.0.0', '0.0.0')).toBe(0);
  });

  it('should return 1 when a > b', () => {
    expect(compareSemanticVersions('1.2.4', '1.2.3')).toBe(1);
    expect(compareSemanticVersions('2.0.0', '1.9.9')).toBe(1);
    expect(compareSemanticVersions('1.10.0', '1.2.9')).toBe(1);
  });

  it('should return -1 when a < b', () => {
    expect(compareSemanticVersions('1.2.3', '1.2.4')).toBe(-1);
    expect(compareSemanticVersions('1.9.9', '2.0.0')).toBe(-1);
    expect(compareSemanticVersions('1.2.9', '1.10.0')).toBe(-1);
  });
});
