/// <reference lib="es2022" />

import { describe, expect, it } from 'vitest';
import {
  getErrorMessage,
  getErrorNumberProperty,
  getErrorStringProperty,
  isErrorLikeRecord,
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
});
