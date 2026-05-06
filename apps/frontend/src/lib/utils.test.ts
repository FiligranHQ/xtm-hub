import { isEmpty } from './utils';

describe('isEmpty', () => {
  // returns true for null values
  it('should return true when value is null', () => {
    expect(isEmpty(null)).toBe(true);
  });
  // handles nested objects correctly
  it('should return false when nested object is not empty', () => {
    const nestedObject = { a: { b: 1 } };
    expect(isEmpty(nestedObject)).toBe(false);
  });
  it('should return true when value is an empty string', () => {
    expect(isEmpty('')).toBe(true);
  });
  it('should return true when value is an empty array', () => {
    expect(isEmpty([])).toBe(true);
  });
});
