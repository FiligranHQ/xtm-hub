import { getErrorStringProperty } from '../../utils/error/error-guard.util';

export class StorageUnavailableError extends Error {
  override readonly cause?: unknown;

  constructor(message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = 'StorageUnavailableError';
    this.cause = options?.cause;
  }
}

export const isObjectNotFoundError = (error: unknown): boolean => {
  const name = getErrorStringProperty(error, 'name');
  return name === 'NoSuchKey' || name === 'NotFound';
};
