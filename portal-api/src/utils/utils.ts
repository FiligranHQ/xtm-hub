import { fromGlobalId } from 'graphql-relay/node/node.js';
import { z } from 'zod';
import { DatabaseType } from '../../knexfile';
import { logApp } from './app-logger.util';

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

export const isImgUrl = async (url: string): Promise<boolean> => {
  const schema = z
    .string()
    .url()
    .refine((val) => {
      const urlRegex = /\.(jpg|jpeg|png|webp|avif|gif)/;
      return urlRegex.test(val);
    });

  const parseResult = schema.safeParse(url);
  if (!parseResult.success) {
    return false;
  }

  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('Content-Type');
    return contentType.startsWith('img') || contentType.startsWith('image');
  } catch (err) {
    logApp.debug(err.message);
    return false;
  }
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

export const omit = <T extends object, K extends keyof T>(
  obj: T,
  keysToOmit: K[]
): Omit<T, K> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !keysToOmit.includes(key as K))
  ) as Omit<T, K>;
};
