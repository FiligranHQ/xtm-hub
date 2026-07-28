import type { Response } from 'express';

export enum ManifestErrorMessage {
  InvalidCount = 'Invalid count',
  InvalidManifestName = 'Invalid manifest name',
  ManifestNotFound = 'Manifest not found',
  TooManyRequests = 'Too many requests, please try again later',
  StorageUnavailable = 'Manifest storage is temporarily unavailable',
  InternalServerError = 'Internal server error',
}

type ManifestErrorStatus = 400 | 404 | 429 | 500 | 503;

const STATUS_BY_MESSAGE: Record<ManifestErrorMessage, ManifestErrorStatus> = {
  [ManifestErrorMessage.InvalidCount]: 400,
  [ManifestErrorMessage.InvalidManifestName]: 400,
  [ManifestErrorMessage.ManifestNotFound]: 404,
  [ManifestErrorMessage.TooManyRequests]: 429,
  [ManifestErrorMessage.StorageUnavailable]: 503,
  [ManifestErrorMessage.InternalServerError]: 500,
};

const sendError = (
  res: Response,
  status: ManifestErrorStatus,
  message: string
): void => {
  // Error responses must never inherit the long-lived cache directive
  // set by the download routes.
  res.removeHeader('Cache-Control');
  res.status(status).json({ code: status, message });
};

export const sendManifestError = (
  res: Response,
  message: ManifestErrorMessage
): void => sendError(res, STATUS_BY_MESSAGE[message], message);

export const sendManifestValidationError = (
  res: Response,
  message: string
): void => sendError(res, 400, message);
