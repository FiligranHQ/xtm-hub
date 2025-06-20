import { type ClassValue, clsx } from 'clsx';

import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const roundToNearest = (num: number | undefined) => {
  if (num === 0 || !num) {
    return 0;
  }
  const power = Math.floor(Math.log10(num));
  const divisor = Math.pow(10, power);
  const rounded = Math.floor(num / divisor) * divisor;

  if (rounded % 1000 === 0) {
    return `+${rounded / 1000}k`;
  }
  if (rounded < 10) {
    return rounded;
  }

  return `${rounded}+`;
};

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

export const getServiceInstanceUrl = (
  base_url: string,
  identifier: string,
  global_service_instance_id: string,
  global_secondary_item_id?: string
) =>
  new URL(
    `/app/service/${identifier}/${global_service_instance_id}${global_secondary_item_id ? `/${global_secondary_item_id}` : ''}`,
    base_url
  );

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};
