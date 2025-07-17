import { describe, expect, it } from 'vitest';
import { isValueInEnum } from './isValueInEnum';

describe('isValueInEnum', () => {
  // Test with string enum
  enum StringEnum {
    FIRST = 'first',
    SECOND = 'second',
    THIRD = 'third',
  }

  // Test with numeric enum
  enum NumericEnum {
    ZERO,
    ONE,
    TWO,
  }

  // Test with const assertion object (enum-like)
  const StatusEnum = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    PENDING: 'pending',
  } as const;

  describe('with string enum', () => {
    it.each([
      ['first', true],
      ['second', true],
      ['third', true],
      ['fourth', false],
      ['', false],
      ['FIRST', false],
    ])('should return %s for value "%s"', (value, expected) => {
      expect(isValueInEnum(value, StringEnum)).toBe(expected);
    });
  });

  describe('with numeric enum', () => {
    it.each([
      [0, true],
      [1, true],
      [2, true],
      [3, false],
      [-1, false],
      ['0', false],
    ])('should return %s for value %s', (value, expected) => {
      expect(isValueInEnum(value, NumericEnum)).toBe(expected);
    });
  });

  describe('with const assertion object', () => {
    it.each([
      ['active', true],
      ['inactive', true],
      ['pending', true],
      ['completed', false],
      ['ACTIVE', false],
    ])('should return %s for value "%s"', (value, expected) => {
      expect(isValueInEnum(value, StatusEnum)).toBe(expected);
    });
  });

  describe('with edge cases', () => {
    it.each([
      [null, false],
      [undefined, false],
      [{}, false],
      [[], false],
      [() => {}, false],
    ])('should return false for %s', (value, expected) => {
      expect(isValueInEnum(value, StringEnum)).toBe(expected);
    });

    it('should handle empty enum object', () => {
      const EmptyEnum = {} as const;
      expect(isValueInEnum('anything', EmptyEnum)).toBe(false);
    });
  });

  describe('type narrowing', () => {
    it('should narrow type when used as type guard', () => {
      const value: unknown = 'first';

      if (isValueInEnum(value, StringEnum)) {
        // TypeScript should recognize value as StringEnum type here
        expect(value).toBe(StringEnum.FIRST);
      } else {
        expect.fail('Should have been a valid enum value');
      }
    });
  });
});
