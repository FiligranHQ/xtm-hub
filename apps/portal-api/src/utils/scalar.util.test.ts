import type { ValueNode } from 'graphql';
import { Kind } from 'graphql';
import { toGlobalId } from 'graphql-relay/node/node.js';
import { describe, expect, it } from 'vitest';
import { createRelayIdScalar } from './scalar.util';

type TestId = string & { __brand: 'TestId' };

describe('createRelayIdScalar', () => {
  const typeName = 'Foo';
  const rawId = 'abc-123' as TestId;
  const globalId = toGlobalId(typeName, rawId);
  const scalar = createRelayIdScalar<TestId>(typeName);

  describe('scalar metadata', () => {
    it('should have the correct name', () => {
      expect(scalar.name).toBe(`${typeName}Id`);
    });

    it('should have the correct description', () => {
      expect(scalar.description).toBe(
        `A Relay global ID for ${typeName}, extracted to a branded ${typeName}Id string`
      );
    });
  });

  describe('serialize', () => {
    it('should encode a raw ID as a Relay global ID', () => {
      expect(scalar.serialize(rawId)).toBe(globalId);
    });

    it.each`
      input        | description
      ${42}        | ${'number'}
      ${null}      | ${'null'}
      ${undefined} | ${'undefined'}
      ${{}}        | ${'object'}
    `(
      'should return empty string for non-string input ($description)',
      ({ input }) => {
        expect(scalar.serialize(input)).toBe('');
      }
    );
  });

  describe('parseValue', () => {
    it('should decode a Relay global ID to the raw ID', () => {
      expect(scalar.parseValue(globalId)).toBe(rawId);
    });

    it.each`
      input        | description
      ${42}        | ${'number'}
      ${null}      | ${'null'}
      ${undefined} | ${'undefined'}
      ${{}}        | ${'object'}
    `('should throw for non-string input ($description)', ({ input }) => {
      expect(() => scalar.parseValue(input)).toThrow(
        `${typeName}Id must be a string`
      );
    });
    it('should return the raw ID as-is if already decoded', () => {
      expect(scalar.parseValue(rawId)).toBe(rawId);
    });
    it('should throw when the global ID encodes a different type', () => {
      const wrongGlobalId = toGlobalId('OtherType', rawId);
      expect(() => scalar.parseValue(wrongGlobalId)).toThrow(
        `Expected a ${typeName} global ID but received a OtherType global ID`
      );
    });
  });

  describe('parseLiteral', () => {
    it('should decode a STRING AST node to the raw ID', () => {
      expect(scalar.parseLiteral({ kind: Kind.STRING, value: globalId })).toBe(
        rawId
      );
    });

    it.each`
      kind          | description
      ${Kind.INT}   | ${'INT'}
      ${Kind.FLOAT} | ${'FLOAT'}
      ${Kind.ENUM}  | ${'ENUM'}
    `(
      'should throw for AST node of kind $description',
      ({ kind, description }) => {
        const ast = { kind, value: description } as ValueNode;
        expect(() => scalar.parseLiteral(ast)).toThrow(
          `${typeName}Id must be a string`
        );
      }
    );
    it('should return the raw ID as-is if already decoded', () => {
      expect(scalar.parseLiteral({ kind: Kind.STRING, value: rawId })).toBe(
        rawId
      );
    });
    it('should throw when the global ID encodes a different type', () => {
      const wrongGlobalId = toGlobalId('OtherType', rawId);
      expect(() =>
        scalar.parseLiteral({ kind: Kind.STRING, value: wrongGlobalId })
      ).toThrow(
        `Expected a ${typeName} global ID but received a OtherType global ID`
      );
    });
  });
});
