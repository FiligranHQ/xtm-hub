import { describe, expect, it } from 'vitest';
import {
  compareVersions,
  doesVersionSatisfy,
  isValidVersion,
} from './versioning';

describe('Versioning', () => {
  describe('isValidVersion', () => {
    it('should return true when given string is a semantic version', () => {
      expect(isValidVersion('1.0.0')).toBe(true);
    });

    it('should return when given string is an lts version without patch', () => {
      expect(isValidVersion('7.260201-lts')).toBe(true);
    });

    it('should return when given string is an lts version with patch', () => {
      expect(isValidVersion('7.260201-lts.version')).toBe(true);
    });

    it('should return false when given string is not a semantic version', () => {
      expect(isValidVersion('1.0.X')).toBe(false);
    });
  });

  describe('doesVersionSatisfy', () => {
    it('should return true when versions are identical', () => {
      expect(
        doesVersionSatisfy({
          givenVersion: '1.0.0',
          requiredVersion: '1.0.0',
        })
      ).toBe(true);
      expect(
        doesVersionSatisfy({
          givenVersion: '7.260201-lts',
          requiredVersion: '7.260201-lts',
        })
      ).toBe(true);
    });

    it('should return false when given version is older than required one', () => {
      expect(
        doesVersionSatisfy({
          givenVersion: '0.9.9',
          requiredVersion: '1.0.0',
        })
      ).toBe(false);
      expect(
        doesVersionSatisfy({
          givenVersion: '6.8.3',
          requiredVersion: '7.260201-lts',
        })
      ).toBe(false);
      expect(
        doesVersionSatisfy({
          givenVersion: '7.260201-lts',
          requiredVersion: '7.260201-lts.1',
        })
      ).toBe(false);
    });

    it('should return true when given version is younger than required one', () => {
      expect(
        doesVersionSatisfy({
          givenVersion: '1.0.0',
          requiredVersion: '0.9.9',
        })
      ).toBe(true);
      expect(
        doesVersionSatisfy({
          givenVersion: '7.260201-lts',
          requiredVersion: '6.8.3',
        })
      ).toBe(true);
      expect(
        doesVersionSatisfy({
          givenVersion: '7.260201-lts.1',
          requiredVersion: '7.260201-lts',
        })
      ).toBe(true);
    });
  });

  describe('compareVersions', () => {
    it('should return 0 when versions are identical', () => {
      expect(compareVersions('1.2.3', '1.2.3')).toBe(0);
      expect(compareVersions('0.0.0', '0.0.0')).toBe(0);

      expect(compareVersions('7.260201-lts', '7.260201-lts')).toBe(0);
      expect(compareVersions('7.260201-lts.1', '7.260201-lts.1')).toBe(0);
    });

    it('should return 1 when a > b', () => {
      // semantic versions
      expect(compareVersions('1.2.4', '1.2.3')).toBe(1);
      expect(compareVersions('2.0.0', '1.9.9')).toBe(1);
      expect(compareVersions('1.10.0', '1.2.9')).toBe(1);

      // lts versions
      expect(compareVersions('8.260201-lts', '7.260201-lts')).toBe(1);
      expect(compareVersions('7.260203-lts', '7.260201-lts')).toBe(1);
      expect(compareVersions('7.260301-lts', '7.260201-lts')).toBe(1);
      expect(compareVersions('7.270201-lts', '7.260201-lts')).toBe(1);
      expect(compareVersions('7.260201-lts.1', '7.260201-lts')).toBe(1);

      // mixed versions
      expect(compareVersions('7.260201-lts', '6.8.3')).toBe(1);
    });

    it('should return -1 when a < b', () => {
      // semantic versions
      expect(compareVersions('1.2.3', '1.2.4')).toBe(-1);
      expect(compareVersions('1.9.9', '2.0.0')).toBe(-1);
      expect(compareVersions('1.2.9', '1.10.0')).toBe(-1);

      // lts versions
      expect(compareVersions('7.260201-lts', '8.260201-lts')).toBe(-1);
      expect(compareVersions('7.260201-lts', '7.260203-lts')).toBe(-1);
      expect(compareVersions('7.260201-lts', '7.260301-lts')).toBe(-1);
      expect(compareVersions('7.260201-lts', '7.270201-lts')).toBe(-1);
      expect(compareVersions('7.260201-lts', '7.260201-lts.1')).toBe(-1);

      // mixed versions
      expect(compareVersions('6.8.3', '7.260201-lts')).toBe(-1);
    });
  });
});
