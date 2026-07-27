import type { Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import {
  ManifestErrorMessage,
  sendManifestError,
} from './manifest-endpoint.errors';

const buildResponse = () => {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  const removeHeader = vi.fn();
  return {
    res: { status, removeHeader } as unknown as Response,
    status,
    json,
    removeHeader,
  };
};

describe('sendManifestError', () => {
  it.each([
    { status: 400 as const, message: ManifestErrorMessage.InvalidCount },
    { status: 404 as const, message: ManifestErrorMessage.ManifestNotFound },
    { status: 429 as const, message: ManifestErrorMessage.TooManyRequests },
    { status: 503 as const, message: ManifestErrorMessage.StorageUnavailable },
  ])(
    'sends $status with a body matching the error contract',
    ({ status, message }) => {
      const { res, status: statusMock, json } = buildResponse();

      sendManifestError(res, status, message);

      expect(statusMock).toHaveBeenCalledWith(status);
      expect(json).toHaveBeenCalledWith({ code: status, message });
    }
  );
  it('clears the cache directive before sending an error', () => {
    const { res, removeHeader } = buildResponse();

    sendManifestError(res, 404, ManifestErrorMessage.ManifestFileNotFound);

    expect(removeHeader).toHaveBeenCalledWith('Cache-Control');
  });
});
