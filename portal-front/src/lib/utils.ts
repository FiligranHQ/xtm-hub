import { type ClassValue, clsx } from 'clsx';
import { Children, isValidElement, ReactElement, ReactNode } from 'react';

import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getValidChildren(children: ReactNode) {
  return Children.toArray(children).filter((child) =>
    isValidElement(child)
  ) as ReactElement[];
}

export const isNil = (value: unknown): value is null | undefined => {
  return value === null || value === undefined;
};

export const isEmpty = (value: unknown): boolean => {
  if (isNil(value)) {
    return true;
  }
  if (
    typeof value === 'string' ||
    Array.isArray(value) ||
    value instanceof Uint8Array
  ) {
    return value.length === 0;
  }
  if (typeof value === 'object' && value !== null) {
    return Object.keys(value).length === 0;
  }
  return false;
};

export const getEnv = () => process.env.NODE_ENV;
export const isProduction = () => getEnv() === 'production';
export const isDevelopment = () =>
  // @ts-expect-error we have staging
  getEnv() !== 'staging' && getEnv() !== 'production';
