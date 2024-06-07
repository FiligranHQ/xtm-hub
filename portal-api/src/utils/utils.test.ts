import {
  getNestedPropertyValue,
  isEmptyField,
  isNil,
  isNotEmptyField,
  parseKeyValueArrayToObject,
  parseKeyValueArrayToObjectReverse,
} from './utils';

describe('utils', () => {
  describe('isNil', () => {
    it.each`
      input        | expected
      ${null}      | ${true}
      ${undefined} | ${true}
      ${{}}        | ${false}
    `('should return $expected for input $input', ({ input, expected }) => {
      expect(isNil(input)).toBe(expected);
    });
  });

  describe('isNotEmptyField', () => {
    it.each`
      input            | expected
      ${null}          | ${false}
      ${undefined}     | ${false}
      ${'a'}           | ${true}
      ${{ a: 'test' }} | ${true}
      ${{}}            | ${false}
    `('should return $expected for input $input', ({ input, expected }) => {
      expect(isNotEmptyField(input)).toBe(expected);
    });
  });

  describe('isEmptyField', () => {
    it.each`
      input            | expected
      ${null}          | ${true}
      ${undefined}     | ${true}
      ${'a'}           | ${false}
      ${{ a: 'test' }} | ${false}
      ${{}}            | ${true}
    `('should return $expected for input $input', ({ input, expected }) => {
      expect(isEmptyField(input)).toBe(expected);
    });
  });

  describe('parseKeyValueArrayToObject', () => {
    it('should parse an array of key:value strings into an object', () => {
      const input = ['key1:value1', 'key2:value2', 'key3:value3'];
      const expectedOutput = {
        key1: 'value1',
        key2: 'value2',
        key3: 'value3',
      };
      expect(parseKeyValueArrayToObject(input)).toEqual(expectedOutput);
    });

    it('should return an empty object for an empty array', () => {
      const input: string[] = [];
      const expectedOutput = {};
      expect(parseKeyValueArrayToObject(input)).toEqual(expectedOutput);
    });

    it('should handle strings with no colon as undefined values', () => {
      const input = ['key1:value1', 'key2value2', 'key3:value3'];
      const expectedOutput = {
        key1: 'value1',
        key2value2: undefined,
        key3: 'value3',
      };
      expect(parseKeyValueArrayToObject(input)).toEqual(expectedOutput);
    });

    it('should overwrite values for duplicate keys', () => {
      const input = ['key1:value1', 'key2:value2', 'key1:value3'];
      const expectedOutput = {
        key1: 'value3',
        key2: 'value2',
      };
      expect(parseKeyValueArrayToObject(input)).toEqual(expectedOutput);
    });

    it('should trim whitespace from keys and values', () => {
      const input = [' key1 : value1 ', ' key2 : value2 '];
      const expectedOutput = {
        ' key1 ': ' value1 ',
        ' key2 ': ' value2 ',
      };
      expect(parseKeyValueArrayToObject(input)).toEqual(expectedOutput);
    });

    it('should handle keys or values with spaces', () => {
      const input = [
        'key with spaces : value with spaces',
        'another key:another value',
      ];
      const expectedOutput = {
        'key with spaces ': ' value with spaces',
        'another key': 'another value',
      };
      expect(parseKeyValueArrayToObject(input)).toEqual(expectedOutput);
    });
  });

  describe('getNestedPropertyValue', () => {
    it('should return the value of a nested property', () => {
      const obj = { a: { b: { c: 'value' } } };
      const paths = 'a.b.c';
      const expectedOutput = 'value';
      expect(getNestedPropertyValue(obj, paths)).toEqual(expectedOutput);
    });

    it('should return an empty array if the property does not exist', () => {
      const obj = { a: { b: { c: 'value' } } };
      const paths = 'a.b.d';
      const expectedOutput = [];
      expect(getNestedPropertyValue(obj, paths)).toEqual(expectedOutput);
    });

    it('should return the original object if paths is empty', () => {
      const obj = { a: { b: { c: 'value' } } };
      const paths = '';
      const expectedOutput = obj;
      expect(getNestedPropertyValue(obj, paths)).toEqual(expectedOutput);
    });

    it('should return an empty array if the object is null or undefined', () => {
      const obj = null;
      const paths = 'a.b.c';
      const expectedOutput = [];
      expect(getNestedPropertyValue(obj, paths)).toEqual(expectedOutput);

      const obj2 = undefined;
      expect(getNestedPropertyValue(obj2, paths)).toEqual(expectedOutput);
    });

    it('should return an empty array if a non-object is passed as the object', () => {
      const obj = 'not an object' as unknown as string[];
      const paths = 'a.b.c';
      const expectedOutput = [];
      expect(getNestedPropertyValue(obj, paths)).toEqual(expectedOutput);
    });

    it('should handle array indices in the path', () => {
      const obj = { a: [{ b: 'value' }] };
      const paths = 'a.0.b';
      const expectedOutput = 'value';
      expect(getNestedPropertyValue(obj, paths)).toEqual(expectedOutput);
    });

    it('should handle paths with multiple dots correctly', () => {
      const obj = { a: { b: { 'c.d': 'value' } } };
      const paths = 'a.b.c.d';
      const expectedOutput = [];
      expect(getNestedPropertyValue(obj, paths)).toEqual(expectedOutput);
    });

    it('should handle objects with properties named "constructor" safely', () => {
      const obj = { constructor: { prototype: { value: 'hidden' } } };
      const paths = 'constructor.prototype.value';
      const expectedOutput = 'hidden';
      expect(getNestedPropertyValue(obj, paths)).toEqual(expectedOutput);
    });
  });

  describe('parseKeyValueArrayToObjectReverse', () => {
    it('should parse a valid key-value array and reverse the keys and values', () => {
      const input = ['a:1', 'b:2', 'c:3'];
      const expectedOutput = { '1': 'a', '2': 'b', '3': 'c' };
      expect(parseKeyValueArrayToObjectReverse(input)).toEqual(expectedOutput);
    });

    it('should return an empty object when given an empty array', () => {
      const input: string[] = [];
      const expectedOutput = {};
      expect(parseKeyValueArrayToObjectReverse(input)).toEqual(expectedOutput);
    });

    it('should handle elements without a colon by using undefined as key', () => {
      const input = ['a:1', 'b2', 'c:3'];
      const expectedOutput = { '1': 'a', undefined: 'b2', '3': 'c' };
      expect(parseKeyValueArrayToObjectReverse(input)).toEqual(expectedOutput);
    });

    it('should handle duplicate values by overwriting with the last occurrence', () => {
      const input = ['a:1', 'b:2', 'c:1'];
      const expectedOutput = { '1': 'c', '2': 'b' };
      expect(parseKeyValueArrayToObjectReverse(input)).toEqual(expectedOutput);
    });
  });
});
