import { describe, expect, it } from 'vitest';
import {
  compareSemanticVersions,
  isCompatibleWithSemanticVersion,
} from './semantic-versioning';

describe('Semantic versioning', () => {
  describe('compareSemanticVersions', () => {
    it('returns 0 when versions are identical', () => {
      expect(compareSemanticVersions('1.2.3', '1.2.3')).toBe(0);
      expect(compareSemanticVersions('0.0.0', '0.0.0')).toBe(0);
    });

    it('returns 1 when a > b', () => {
      expect(compareSemanticVersions('1.2.4', '1.2.3')).toBe(1);
      expect(compareSemanticVersions('2.0.0', '1.9.9')).toBe(1);
      expect(compareSemanticVersions('1.10.0', '1.2.9')).toBe(1);
    });

    it('returns -1 when a < b', () => {
      expect(compareSemanticVersions('1.2.3', '1.2.4')).toBe(-1);
      expect(compareSemanticVersions('1.9.9', '2.0.0')).toBe(-1);
      expect(compareSemanticVersions('1.2.9', '1.10.0')).toBe(-1);
    });
  });

  describe('isCompatibleWithSemanticVersion', () => {
    it('should return true when versions are identical', () => {
      expect(isCompatibleWithSemanticVersion('1.0.0', '1.0.0')).toBe(true);
    });

    it('should return false when given version is older than required one', () => {
      expect(isCompatibleWithSemanticVersion('0.9.9', '1.0.0')).toBe(false);
    });

    it('should return true when given version is younger than required one', () => {
      expect(isCompatibleWithSemanticVersion('1.0.0', '0.9.9')).toBe(true);
    });
  });
});
