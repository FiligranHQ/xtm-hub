import { describe, expect, it } from 'vitest';
import { hasProperty } from './hasProperty';

describe('hasProperty', () => {
  it('should return true when object has the property', () => {
    const obj = { name: 'test', age: 25 };
    expect(hasProperty(obj, 'name')).toBe(true);
    expect(hasProperty(obj, 'age')).toBe(true);
  });

  it('should return false when object does not have the property', () => {
    const obj = { name: 'test' };
    expect(hasProperty(obj, 'missing')).toBe(false);
  });

  it('should return true for properties with falsy values', () => {
    const obj = {
      empty: '',
      zero: 0,
      falsy: false,
      nil: null,
      undef: undefined,
    };
    expect(hasProperty(obj, 'empty')).toBe(true);
    expect(hasProperty(obj, 'zero')).toBe(true);
    expect(hasProperty(obj, 'falsy')).toBe(true);
    expect(hasProperty(obj, 'nil')).toBe(true);
    expect(hasProperty(obj, 'undef')).toBe(true);
  });

  it('should return false for null input', () => {
    expect(hasProperty(null, 'key')).toBe(false);
  });

  it('should return false for undefined input', () => {
    expect(hasProperty(undefined, 'key')).toBe(false);
  });

  it('should return false for primitive input', () => {
    expect(hasProperty('string', 'length')).toBe(false);
    expect(hasProperty(42, 'toString')).toBe(false);
  });

  it('should work with arrays', () => {
    const arr = [1, 2, 3];
    expect(hasProperty(arr, 'length')).toBe(true);
    expect(hasProperty(arr, 0)).toBe(true);
    expect(hasProperty(arr, 5)).toBe(false);
  });

  it('should return true for inherited properties', () => {
    const parent = { inherited: true };
    const child = Object.create(parent);
    child.own = 'value';
    expect(hasProperty(child, 'inherited')).toBe(true);
    expect(hasProperty(child, 'own')).toBe(true);
  });
});
