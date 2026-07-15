/// <reference lib="es2022" />

import { describe, expect, it } from 'vitest';
import {
  getErrorMessage,
  getErrorNumberProperty,
  getErrorStringProperty,
  isErrorLikeRecord,
  isUniqueConstraintViolation,
  toError,
} from './error-guard.util';
import { UnknownErrorCode } from './error.code';

describe('error guard util', () => {
  describe('isErrorLikeRecord', () => {
    it.each`
      value                  | expected
      ${null}                | ${false}
      ${undefined}           | ${false}
      ${'error'}             | ${false}
      ${42}                  | ${false}
      ${true}                | ${false}
      ${Symbol('symbol')}    | ${false}
      ${{}}                  | ${true}
      ${{ message: 'boom' }} | ${true}
      ${new Error('boom')}   | ${true}
      ${[]}                  | ${true}
    `('should return $expected for value $value', ({ expected, value }) => {
      // When
      const result = isErrorLikeRecord(value);

      // Then
      expect(result).toBe(expected);
    });
  });

  describe('toError', () => {
    it('should return the same error instance when input is an Error', () => {
      // Given
      const error = new Error('boom');

      // When
      const result = toError(error);

      // Then
      expect(result).toBe(error);
      expect(result).toMatchObject({ message: 'boom' });
    });

    it.each`
      input                      | expectedMessage                  | expectedCauseIsInput
      ${'boom'}                  | ${'boom'}                        | ${false}
      ${{ message: 'from map' }} | ${'from map'}                    | ${true}
      ${null}                    | ${UnknownErrorCode.UnknownError} | ${true}
      ${undefined}               | ${UnknownErrorCode.UnknownError} | ${true}
      ${12}                      | ${UnknownErrorCode.UnknownError} | ${true}
      ${false}                   | ${UnknownErrorCode.UnknownError} | ${true}
      ${{}}                      | ${UnknownErrorCode.UnknownError} | ${true}
      ${{ message: 12 }}         | ${UnknownErrorCode.UnknownError} | ${true}
      ${{ message: undefined }}  | ${UnknownErrorCode.UnknownError} | ${true}
    `(
      'should normalize input $input with message $expectedMessage',
      ({ expectedCauseIsInput, expectedMessage, input }) => {
        // Given

        // When
        const result = toError(input);

        // Then
        expect(result).toBeInstanceOf(Error);
        expect(result).toMatchObject({ message: expectedMessage });

        if (expectedCauseIsInput) {
          expect(result.cause).toBe(input);
        } else {
          expect(result.cause).toBeUndefined();
        }
      }
    );
  });

  describe('getErrorMessage', () => {
    it.each`
      input                      | expected
      ${new Error('boom')}       | ${'boom'}
      ${'plain message'}         | ${'plain message'}
      ${{ message: 'from map' }} | ${'from map'}
      ${null}                    | ${UnknownErrorCode.UnknownError}
      ${{ message: 42 }}         | ${UnknownErrorCode.UnknownError}
    `('should return $expected for input $input', ({ expected, input }) => {
      // Given

      // When
      const result = getErrorMessage(input);

      // Then
      expect(result).toBe(expected);
    });
  });

  describe('getErrorStringProperty', () => {
    it.each`
      input                      | key          | expected
      ${{ message: 'boom' }}     | ${'message'} | ${'boom'}
      ${{ code: 'ERR_TEST' }}    | ${'code'}    | ${'ERR_TEST'}
      ${new Error('from error')} | ${'message'} | ${'from error'}
      ${{ message: 42 }}         | ${'message'} | ${undefined}
      ${{ code: null }}          | ${'code'}    | ${undefined}
      ${null}                    | ${'message'} | ${undefined}
      ${12}                      | ${'message'} | ${undefined}
    `(
      'should return $expected for key $key and input $input',
      ({ expected, input, key }) => {
        // Given

        // When
        const result = getErrorStringProperty(input, key);

        // Then
        expect(result).toBe(expected);
      }
    );
  });

  describe('getErrorNumberProperty', () => {
    it.each`
      input                      | key         | expected
      ${{ status: 500 }}         | ${'status'} | ${500}
      ${{ count: 0 }}            | ${'count'}  | ${0}
      ${{ score: Number.NaN }}   | ${'score'}  | ${Number.NaN}
      ${{ status: '500' }}       | ${'status'} | ${undefined}
      ${{ status: null }}        | ${'status'} | ${undefined}
      ${new Error('from error')} | ${'status'} | ${undefined}
      ${null}                    | ${'status'} | ${undefined}
      ${'string'}                | ${'status'} | ${undefined}
    `(
      'should return $expected for key $key and input $input',
      ({ expected, input, key }) => {
        // Given

        // When
        const result = getErrorNumberProperty(input, key);

        // Then
        expect(result).toBe(expected);
      }
    );
  });

  describe('isUniqueConstraintViolation', () => {
    it.each`
      input                                                                    | constraintName  | expected | description
      ${{ code: '23505', constraint: 'foo_unique' }}                           | ${'foo_unique'} | ${true}  | ${'code + matching constraint'}
      ${{ code: '23505', constraint: 'bar_unique' }}                           | ${'foo_unique'} | ${false} | ${'code + non-matching constraint'}
      ${{ code: '23505', message: 'duplicate key value violates foo_unique' }} | ${'foo_unique'} | ${true}  | ${'code, no constraint, message fallback matches'}
      ${{ code: '23505', message: 'duplicate key value violates bar_unique' }} | ${'foo_unique'} | ${false} | ${'code, no constraint, message fallback mismatches'}
      ${{ constraint: 'foo_unique' }}                                          | ${'foo_unique'} | ${true}  | ${'no code, matching constraint'}
      ${{ constraint: 'bar_unique' }}                                          | ${'foo_unique'} | ${false} | ${'no code, non-matching constraint'}
      ${new Error('foo_unique constraint violated')}                           | ${'foo_unique'} | ${true}  | ${'no code/constraint, message fallback matches'}
      ${new Error('unrelated error')}                                          | ${'foo_unique'} | ${false} | ${'no code/constraint, message fallback mismatches'}
      ${{ code: '42P01', constraint: 'foo_unique' }}                           | ${'foo_unique'} | ${true}  | ${'different code but matching constraint still matches'}
    `(
      'should return $expected for $description',
      ({ constraintName, expected, input }) => {
        // Given

        // When
        const result = isUniqueConstraintViolation(input, constraintName);

        // Then
        expect(result).toBe(expected);
      }
    );
  });
});
