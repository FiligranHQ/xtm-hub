import config from 'config';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FeatureFlag } from '../__generated__/resolvers-types';
import { isFeatureEnabled, resolveFeatureFlags } from './feature-flag.util';

vi.mock('config', async (importOriginal) => {
  const mod = await importOriginal<{ default: typeof config }>();
  return {
    default: {
      get: vi.fn(mod.default.get.bind(mod.default)),
      has: mod.default.has.bind(mod.default),
    },
  };
});

describe('resolveFeatureFlags', () => {
  const allFlags = Object.values(FeatureFlag);

  describe('wildcard handling', () => {
    it('should return all flags when "*" is present', () => {
      const result = resolveFeatureFlags(['*']);
      expect(result).toEqual(allFlags);
    });

    it('should return all flags when "*" is mixed with other values', () => {
      const result = resolveFeatureFlags(['*', 'DUMMY', 'INVALID']);
      expect(result).toEqual(allFlags);
    });
  });

  describe('flag validation', () => {
    it.each`
      enabledFeatures | expected               | description
      ${['DUMMY']}    | ${[FeatureFlag.Dummy]} | ${'single valid flag'}
      ${[]}           | ${[]}                  | ${'empty array'}
      ${['INVALID']}  | ${[]}                  | ${'single invalid flag'}
      ${['DUMM']}     | ${[]}                  | ${'typo in flag name'}
      ${['dummy']}    | ${[]}                  | ${'lowercase flag name'}
    `(
      'should return $expected for $description',
      ({ enabledFeatures, expected }) => {
        expect(resolveFeatureFlags(enabledFeatures)).toEqual(expected);
      }
    );
  });

  describe('mixed valid and invalid flags', () => {
    it('should keep valid flags and filter out invalid ones', () => {
      const result = resolveFeatureFlags(['DUMMY', 'NONEXISTENT', 'TYPO']);
      expect(result).toEqual([FeatureFlag.Dummy]);
    });
  });
});

describe('isFeatureEnabled', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('when feature is enabled', () => {
    it.each`
      enabledFeatures       | description
      ${['DUMMY']}          | ${'flag is explicitly listed'}
      ${['DUMMY', 'OTHER']} | ${'flag is among multiple flags'}
      ${['*']}              | ${'wildcard is present'}
      ${['*', 'DUMMY']}     | ${'wildcard is mixed with flag'}
    `('should return true when $description', ({ enabledFeatures }) => {
      vi.mocked(config.get).mockReturnValue(enabledFeatures);
      expect(isFeatureEnabled(FeatureFlag.Dummy)).toBe(true);
    });
  });

  describe('when feature is not enabled', () => {
    it.each`
      enabledFeatures | description
      ${[]}           | ${'list is empty'}
      ${['OTHER']}    | ${'flag is not in list'}
      ${undefined}    | ${'config returns undefined'}
    `(
      'should throw ForbiddenAccess when $description',
      ({ enabledFeatures }) => {
        vi.mocked(config.get).mockReturnValue(enabledFeatures);
        expect(() => isFeatureEnabled(FeatureFlag.Dummy)).toThrow(
          "Feature 'DUMMY' is not enabled."
        );
      }
    );
  });
});
