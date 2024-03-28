import { fromGlobalId } from 'graphql-relay/node/node.js';
import { DatabaseType } from '../../knexfile';

export const extractId = (id: string) => {
  const { id: databaseId } = fromGlobalId(id) as { type: DatabaseType, id: string };
  return databaseId;
};
export const isEmpty = (value: unknown): boolean => {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value === 'string' || Array.isArray(value) || value instanceof Uint8Array) {
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
  return paths.split('.').reduce((acc, path) => acc && acc[path], obj) ?? [];
};
