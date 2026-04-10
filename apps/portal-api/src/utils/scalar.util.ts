import { GraphQLScalarType, Kind } from 'graphql';
import { fromGlobalId, toGlobalId } from 'graphql-relay/node/node.js';

const parseRelayId = <T extends string>(typeName: string, value: string): T => {
  const { type, id } = fromGlobalId(value);
  if (type === typeName && id) {
    return id as T;
  }
  // Already a raw ID (not a Relay-encoded global ID)
  return value as T;
};

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
        return parseRelayId<T>(typeName, value);
      }
      throw new Error(`${typeName}Id must be a string`);
    },
    parseLiteral(ast): T {
      if (ast.kind === Kind.STRING) {
        return parseRelayId<T>(typeName, ast.value);
      }
      throw new Error(`${typeName}Id must be a string`);
    },
  });
