import { getDirective, MapperKind, mapSchema } from '@graphql-tools/utils';
import {
  defaultFieldResolver,
  GraphQLFieldConfig,
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLOutputType,
  GraphQLSchema,
  GraphQLType,
  isInputObjectType,
  isListType,
  isNonNullType,
  isObjectType,
} from 'graphql';
import { fromGlobalId, toGlobalId } from 'graphql-relay/node/node.js';
import { BadRequestError } from '../../utils/error/error.util';

export const ID_DIRECTIVE_NAME = 'id';

type IdDirective = {
  type: string;
};

type InputIdFieldInfo = {
  fieldName: string;
  idDirective: IdDirective;
  fieldType: GraphQLInputType;
};
type InputTypeIdFieldInfo = Record<string, InputIdFieldInfo[]>;

/**
 * Recursively traverses a GraphQL output value, handling NonNull and List wrappers.
 * Calls the provided onLeaf handler for each leaf value.
 * Used to encode field results as Relay global ids.
 */
const traverseOutputValue = (
  value: unknown,
  type: GraphQLOutputType,
  onLeaf: (v: unknown) => unknown
): unknown => {
  if (value === null || value === undefined) return value;
  if (isNonNullType(type))
    return traverseOutputValue(value, type.ofType, onLeaf);
  if (isListType(type))
    return Array.isArray(value)
      ? value.map((v) => traverseOutputValue(v, type.ofType, onLeaf))
      : value;
  return onLeaf(value);
};

interface TraversalContext {
  isIdField: boolean;
  idDirective?: IdDirective;
  fieldType?: GraphQLInputType;
}

/**
 * Recursively traverses a GraphQL input value, handling NonNull, List, and InputObject wrappers.
 * For each field annotated with @id, calls the handler with isIdField=true.
 * For nested input objects, recurses into their fields.
 * Used to decode arguments containing global ids before resolver execution.
 */
const traverseInputValue = (
  value: unknown,
  type: GraphQLInputType,
  idFields: InputTypeIdFieldInfo,
  handler: (v: unknown, ctx: TraversalContext) => unknown
): unknown => {
  if (value === null || value === undefined) return value;
  if (isNonNullType(type))
    return traverseInputValue(value, type.ofType, idFields, handler);
  if (isListType(type))
    return Array.isArray(value)
      ? value.map((v) => traverseInputValue(v, type.ofType, idFields, handler))
      : value;
  const inputObjType = getInputObjectType(type);
  if (inputObjType && typeof value === 'object' && !Array.isArray(value)) {
    const copy = { ...(value as Record<string, unknown>) };
    // Handle all direct @id fields for this input object type
    const idFieldArr = idFields[inputObjType.name] || [];
    for (const { fieldName, idDirective, fieldType } of idFieldArr) {
      if (Object.prototype.hasOwnProperty.call(copy, fieldName)) {
        copy[fieldName] = handler(copy[fieldName], {
          isIdField: true,
          idDirective,
          fieldType,
        });
      }
    }
    // Recurse into all nested input objects
    for (const [fieldName, field] of Object.entries(inputObjType.getFields())) {
      if (!Object.prototype.hasOwnProperty.call(copy, fieldName)) continue;
      const nestedInputType = getInputObjectType(field.type);
      if (nestedInputType) {
        copy[fieldName] = traverseInputValue(
          copy[fieldName],
          field.type,
          idFields,
          handler
        );
      }
    }
    return copy;
  }
  // Not an input object: call handler for leaf value
  return handler(value, { isIdField: false });
};

/** Reads the first `@id` directive attached to any schema element (field, arg, input field). */
const getIdDirective = (
  schema: GraphQLSchema,
  target: unknown
): IdDirective | undefined => {
  return getDirective(schema, target, ID_DIRECTIVE_NAME)?.[0] as
    | IdDirective
    | undefined;
};

/** Unwraps NonNull/List layers and returns the underlying InputObjectType, or null if the leaf is a scalar/enum. */
const getInputObjectType = (
  inputType: GraphQLInputType
): GraphQLInputObjectType | null => {
  let unwrapped: GraphQLType = inputType;
  while (isNonNullType(unwrapped) || isListType(unwrapped)) {
    unwrapped = unwrapped.ofType;
  }
  return isInputObjectType(unwrapped) ? unwrapped : null;
};

/**
 * Collects information about all input object types that have fields annotated with @id,
 * and determines which input types (directly or transitively) contain any @id field.
 * This is used to efficiently identify which arguments need global id decoding.
 * Handles cycles in the input type graph (e.g., mutually referential input types).
 */
const getInputIdFieldInfo = (
  schema: GraphQLSchema
): {
  inputTypeIdFieldInfo: InputTypeIdFieldInfo;
  inputTypesWithAnyIdField: Set<string>;
} => {
  const inputTypeIdFieldInfo: InputTypeIdFieldInfo = {};
  const inputTypesWithAnyIdField = new Set<string>();
  // Track DFS state to avoid infinite recursion on cycles
  const state = new Map<string, 'visiting' | 'visited'>();
  const stack: string[] = [];

  // First pass: collect all fields with a direct @id directive for each input object type
  for (const type of Object.values(schema.getTypeMap())) {
    if (!isInputObjectType(type) || type.name.startsWith('__')) continue;
    const fields: InputIdFieldInfo[] = [];
    for (const [fieldName, field] of Object.entries(type.getFields())) {
      const idDirective = getIdDirective(schema, field);
      if (idDirective) {
        fields.push({ fieldName, idDirective, fieldType: field.type });
      }
    }
    if (fields.length > 0) {
      inputTypeIdFieldInfo[type.name] = fields;
    }
  }

  /**
   * Second pass: DFS to find all input types that (directly or transitively) contain any @id field.
   * Handles cycles by marking types as 'visiting' and using a stack to propagate the presence of @id fields.
   * If a cycle is detected and any type in the stack has an @id field, all types in the cycle are marked.
   */
  const dfs = (type: GraphQLInputObjectType) => {
    const curState = state.get(type.name);
    if (curState === 'visiting') {
      // Cycle detected: if any type in stack has an id field, mark all
      if (stack.some((t) => inputTypesWithAnyIdField.has(t))) {
        stack.forEach((t) => inputTypesWithAnyIdField.add(t));
      }
      return;
    }
    if (curState === 'visited') return;
    state.set(type.name, 'visiting');
    stack.push(type.name);

    let found = false;
    // If this type has a direct @id field, mark as found
    if (inputTypeIdFieldInfo[type.name]?.length) {
      found = true;
    }
    // Recurse into all nested input object fields
    for (const field of Object.values(type.getFields())) {
      const nested = getInputObjectType(field.type);
      if (nested) {
        dfs(nested);
        if (inputTypesWithAnyIdField.has(nested.name)) found = true;
      }
    }
    // If found, mark all types in the current stack as containing an @id field
    if (found) stack.forEach((t) => inputTypesWithAnyIdField.add(t));
    stack.pop();
    state.set(type.name, 'visited');
  };

  // Run DFS for all input object types
  for (const type of Object.values(schema.getTypeMap())) {
    if (isInputObjectType(type) && !type.name.startsWith('__')) {
      dfs(type);
    }
  }

  return { inputTypeIdFieldInfo, inputTypesWithAnyIdField };
};

/**
 * Decodes a Relay global id and asserts its type prefix matches the expected type.
 * Throws a BadRequestError if the id is invalid or the type does not match.
 */
const decodeGlobalId = (encodedId: string, expectedType: string): string => {
  let parsedGlobalId: { type: string; id: string };

  try {
    parsedGlobalId = fromGlobalId(encodedId);
  } catch (_error) {
    throw BadRequestError(`Invalid global id for type ${expectedType}`);
  }

  if (parsedGlobalId.type !== expectedType) {
    throw BadRequestError(
      `Expected global id of type ${expectedType}, got ${parsedGlobalId.type}`
    );
  }

  return parsedGlobalId.id;
};

/**
 * Decodes a value (or nested structure) by type, recursively decoding all @id fields.
 * If a field is annotated with @id, decodes it as a global id and recurses if needed.
 * Used for both direct arguments and nested input object fields.
 */
const decodeValueByType = (
  encodedValue: unknown,
  inputType: GraphQLInputType,
  expectedType: string,
  idFields: InputTypeIdFieldInfo
): unknown =>
  traverseInputValue(encodedValue, inputType, idFields, (v, ctx) =>
    ctx.isIdField && ctx.idDirective && ctx.fieldType
      ? decodeValueByType(v, ctx.fieldType, ctx.idDirective.type, idFields)
      : decodeGlobalId(String(v), expectedType)
  );

const encodeValueByType = (
  value: unknown,
  outputType: GraphQLOutputType,
  expectedType: string
): unknown =>
  traverseOutputValue(value, outputType, (v) =>
    v == null ? v : toGlobalId(expectedType, String(v))
  );

/**
 * Decodes all @id-annotated arguments of a field, replacing Relay global IDs with raw DB ids.
 * Handles both scalar arguments with a direct @id directive and input object arguments
 * whose fields carry @id directives (recursively).
 */
const decodeArgIdDirectives = (
  args: Record<string, unknown>,
  fieldConfig: GraphQLFieldConfig<unknown, unknown>,
  schema: GraphQLSchema,
  inputTypeIdFieldInfo: InputTypeIdFieldInfo
): Record<string, unknown> => {
  const parsedArgs: Record<string, unknown> = { ...args };
  for (const [argName, argConfig] of Object.entries(fieldConfig.args ?? {})) {
    const argValue = parsedArgs[argName];
    const idDirective = getIdDirective(schema, argConfig);
    if (idDirective) {
      parsedArgs[argName] = decodeValueByType(
        argValue,
        argConfig.type,
        idDirective.type,
        inputTypeIdFieldInfo
      );
      continue;
    }
    const inputObjectType = getInputObjectType(argConfig.type);
    if (!inputObjectType) {
      parsedArgs[argName] = argValue;
      continue;
    }
    parsedArgs[argName] = traverseInputValue(
      argValue,
      argConfig.type,
      inputTypeIdFieldInfo,
      (v, ctx) =>
        ctx.isIdField && ctx.idDirective && ctx.fieldType
          ? decodeValueByType(
              v,
              ctx.fieldType,
              ctx.idDirective.type,
              inputTypeIdFieldInfo
            )
          : v
    );
  }
  return parsedArgs;
};

const isNodeIdFieldWithIdDirective = (
  schema: GraphQLSchema,
  fieldName: string,
  typeName: string | undefined,
  idDirective: IdDirective | undefined
): boolean => {
  if (!idDirective || fieldName !== 'id' || !typeName) {
    return false;
  }

  const parentType = schema.getType(typeName);
  if (!isObjectType(parentType)) {
    return false;
  }

  return parentType
    .getInterfaces()
    .some((interfaceType) => interfaceType.name === 'Node');
};

/**
 * Schema transformer for the `@id` directive.
 *
 * For every object field in the schema it:
 * 1. Decodes `@id`-annotated arguments (Relay global ID → raw DB id) before the resolver runs.
 * 2. Encodes the resolver's return value as a Relay global ID when the field itself carries `@id`.
 */
export const idDirectiveTransformer = (
  schema: GraphQLSchema
): GraphQLSchema => {
  const { inputTypeIdFieldInfo, inputTypesWithAnyIdField } =
    getInputIdFieldInfo(schema);
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig, fieldName, typeName) => {
      const idDirective = getIdDirective(schema, fieldConfig);

      if (
        isNodeIdFieldWithIdDirective(schema, fieldName, typeName, idDirective)
      ) {
        throw new Error(
          `Invalid @id usage on ${typeName}.id: Node ids are already globally encoded by the Node.id resolver.`
        );
      }

      const argumentConfigs = Object.values(fieldConfig.args ?? {});
      const hasArgumentDirective = argumentConfigs.some((argConfig) =>
        Boolean(getIdDirective(schema, argConfig))
      );
      const hasInputObjectArgumentWithId = argumentConfigs.some((argConfig) => {
        const inputObj = getInputObjectType(argConfig.type);
        return inputObj && inputTypesWithAnyIdField.has(inputObj.name);
      });
      const shouldDecodeArguments =
        hasArgumentDirective || hasInputObjectArgumentWithId;

      if (!idDirective && !shouldDecodeArguments) {
        return fieldConfig;
      }

      const { resolve = defaultFieldResolver } = fieldConfig;
      fieldConfig.resolve = async (source, args, context, info) => {
        const rawArgs = (args as Record<string, unknown> | undefined) ?? {};
        const hasAnyArgValue = Object.keys(rawArgs).length > 0;
        const parsedArgs =
          shouldDecodeArguments && hasAnyArgValue
            ? decodeArgIdDirectives(
                rawArgs,
                fieldConfig,
                schema,
                inputTypeIdFieldInfo
              )
            : rawArgs;

        const result = await resolve(source, parsedArgs, context, info);

        if (!idDirective) {
          return result;
        }

        return encodeValueByType(result, fieldConfig.type, idDirective.type);
      };

      return fieldConfig;
    },
  });
};
