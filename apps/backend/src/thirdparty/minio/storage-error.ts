import { getErrorStringProperty } from '../../utils/error/error-guard.util';

export class StorageUnavailableError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'StorageUnavailableError';
  }
}

export const isObjectNotFoundError = (error: unknown): boolean => {
  const name = getErrorStringProperty(error, 'name');
  return name === 'NoSuchKey' || name === 'NotFound';
};
