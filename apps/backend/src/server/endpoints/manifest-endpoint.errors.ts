import type { Response } from 'express';

export enum ManifestErrorMessage {
  InvalidCount = 'Invalid count',
  InvalidManifestName = 'Invalid manifest name',
  ManifestNotFound = 'Manifest not found',
  ManifestFileNotFound = 'Manifest file not found',
  TooManyRequests = 'Too many requests, please try again later',
  StorageUnavailable = 'Manifest storage is temporarily unavailable',
  InternalServerError = 'Internal server error',
}

export type ManifestErrorStatus = 400 | 404 | 429 | 500 | 503;

export const sendManifestError = (
  res: Response,
  status: ManifestErrorStatus,
  message: string
): void => {
  // Error responses must never inherit the long-lived cache directive
  // set by the download routes.
  res.removeHeader('Cache-Control');
  res.status(status).json({ code: status, message });
};
