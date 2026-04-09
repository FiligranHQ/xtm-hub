import { GraphQLScalarType, Kind } from 'graphql';
import { toGlobalId } from 'graphql-relay/node/node.js';
import { extractId } from './utils';

export const createRelayIdScalar = <T extends string>(
  typeName: string
): GraphQLScalarType =>
  new GraphQLScalarType({
    name: `${typeName}Id`,
    description: `A Relay global ID for ${typeName}, extracted to a branded ${typeName}Id string`,
    serialize(value: unknown): string {
      return typeof value === 'string' ? toGlobalId(typeName, value) : '';
    },
    parseValue(value: unknown): T {
      if (typeof value === 'string') {
        return extractId<T>(value);
      }
      throw new Error(`${typeName}Id must be a string`);
    },
    parseLiteral(ast): T {
      if (ast.kind === Kind.STRING) {
        return extractId<T>(ast.value);
      }
      throw new Error(`${typeName}Id must be a string`);
    },
  });
