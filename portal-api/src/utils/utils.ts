import { fromGlobalId } from 'graphql-relay/node/node.js';
import { DatabaseType } from '../../knexfile';

export const extractId = <T extends string>(id: string) => {
  const { id: databaseId } = fromGlobalId(id) as {
    type: DatabaseType;
    id: T;
  };
  return databaseId;
};
export const isEmpty = (value: unknown): boolean => {
  if (value === null || value === undefined) {
    return true;
  }
  if (
    typeof value === 'string' ||
    Array.isArray(value) ||
    value instanceof Uint8Array
  ) {
    return value.length === 0;
  }
  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }
  return false;
};
export const isNil = (value: unknown): boolean => {
  return value === null || value === undefined;
};
export const isNotEmptyField = (field: unknown): boolean => {
  return !isEmpty(field) && !isNil(field);
};
export const isEmptyField = (field: unknown): boolean => {
  return isEmpty(field) || isNil(field);
};

export const now = () => new Date().getUTCDate();

export const getNestedPropertyValue = (obj: object, paths: string) => {
  if (!paths || paths.length === 0) {
    return obj;
  }
  return paths.split('.').reduce((acc, path) => acc && acc[path], obj) ?? [];
};

export const parseKeyValueArrayToObject = (array: string[]) => {
  const result = {};
  for (const item of array) {
    const [key, value] = item.split(':');
    result[key] = value;
  }
  return result;
};

export const parseKeyValueArrayToObjectReverse = (array: string[]) => {
  const result = {};
  for (const item of array) {
    const [key, value] = item.split(':');
    result[value] = key;
  }
  return result;
};

export const keysOf = <T>(): Array<keyof T> => [] as unknown as Array<keyof T>;

export const omit = <T extends object, K extends keyof T>(
  obj: T,
  keysToOmit: K[]
): Omit<T, K> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !keysToOmit.includes(key as K))
  ) as Omit<T, K>;
};

/**
 * Returns a new object which is a subset of the input, including only the specified properties.
 * Can be called with a single argument (array of props to pick), in which case it returns a partially
 * applied pick function.
 */
export function pick<T extends string>(
  props: T[]
): <U>(input: U) => Pick<U, Extract<keyof U, T>>;
export function pick<U, T extends keyof U>(
  input: U,
  props: T[]
): { [K in T]: U[K] };
export function pick<U, T extends keyof U>(
  inputOrProps: U | T[],
  maybeProps?: T[]
): { [K in T]: U[K] } | ((input: U) => Pick<U, Extract<keyof U, T>>) {
  const _pick = <U, T extends keyof U>(
    input: U,
    props: T[]
  ): { [K in T]: U[K] } => {
    const output: any = {};
    for (const prop of props) {
      output[prop] = input[prop];
    }
    return output;
  };
  if (Array.isArray(inputOrProps)) {
    return (input: U) => _pick(input, inputOrProps);
  } else {
    return _pick(inputOrProps, maybeProps || []);
  }
}
