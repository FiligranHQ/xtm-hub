import type { Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import {
  ManifestErrorMessage,
  sendManifestError,
  sendManifestValidationError,
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
    { message: ManifestErrorMessage.InvalidCount, status: 400 },
    { message: ManifestErrorMessage.StorageUnavailable, status: 503 },
  ])('derives $status from the message', ({ message, status }) => {
    const { res, status: statusMock, json } = buildResponse();

    sendManifestError(res, message);

    expect(statusMock).toHaveBeenCalledWith(status);
    expect(json).toHaveBeenCalledWith({ code: status, message });
  });

  it('clears the cache directive before sending an error', () => {
    const { res, removeHeader } = buildResponse();

    sendManifestError(res, ManifestErrorMessage.ManifestNotFound);

    expect(removeHeader).toHaveBeenCalledWith('Cache-Control');
  });
});

describe('sendManifestValidationError', () => {
  it('answers 400 with the message built by the validator', () => {
    const { res, status, json } = buildResponse();

    sendManifestValidationError(res, 'Invalid product');

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({
      code: 400,
      message: 'Invalid product',
    });
  });
});
