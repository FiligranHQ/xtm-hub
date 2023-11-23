import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Children, isValidElement, ReactElement, ReactNode } from 'react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getValidChildren(children: ReactNode) {
  return Children.toArray(children).filter((child) =>
    isValidElement(child)
  ) as ReactElement[];
}