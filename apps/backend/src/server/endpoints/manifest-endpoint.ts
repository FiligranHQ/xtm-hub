import cors from 'cors';
import { Express, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { Readable } from 'stream';
import {
  ManifestType,
  PlatformIdentifier,
} from '../../__generated__/resolvers-types';
import { ManifestFragmentHelper } from '../../modules/shareable-resource/manifest-fragment/manifest-fragment.helper';
import { ManifestDomain } from '../../modules/shareable-resource/manifest/manifest.domain';
import { ManifestHelper } from '../../modules/shareable-resource/manifest/manifest.helper';
import { MinIOClient } from '../../thirdparty/minio/client';
import { logApp } from '../../utils/app-logger.util';
import {
  isIntegrationType,
  isProduct,
  isValidManifestName,
  parseCount,
} from './manifest-endpoint.utils';

const MANIFEST_RATE_WINDOW_MS = 60 * 1000;
const MANIFEST_RATE_MAX = 300;

const manifestRateLimiter = rateLimit({
  windowMs: MANIFEST_RATE_WINDOW_MS,
  max: MANIFEST_RATE_MAX,
  standardHeaders: true,
  legacyHeaders: false,
});

export const listManifests = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const params = validateManifestParams(req, res);
    if (!params) return;

    const count = parseCount(req.query.count);
    if (count === undefined) {
      res.status(400).json({ code: 400, message: 'Invalid count' });
      return;
    }

    const manifests = await ManifestDomain.loadManifests(
      params.product,
      params.version,
      params.integrationType,
      count
    );
    res.status(200).json({ manifests });
  } catch (error) {
    logApp.error('Error while listing manifests', { error });
    res.status(500).json({ code: 500, message: 'Internal server error' });
  }
};

const validateManifestParams = (
  req: Request,
  res: Response
): {
  product: PlatformIdentifier;
  version: string;
  integrationType: ManifestType;
} | null => {
  const { product, version, integrationType } = req.params;

  if (!isProduct(product)) {
    res.status(400).json({ code: 400, message: 'Invalid product' });
    return null;
  }
  if (!isIntegrationType(integrationType)) {
    res.status(400).json({ code: 400, message: 'Invalid integrationType' });
    return null;
  }
  if (typeof version !== 'string') {
    res.status(400).json({ code: 400, message: 'Invalid version' });
    return null;
  }
  try {
    ManifestFragmentHelper.validateAndFormatManifestVersion(version);
  } catch {
    res.status(400).json({ code: 400, message: 'Invalid version format' });
    return null;
  }

  return { product, version, integrationType };
};

export const manifestEndpoint = (app: Express) => {
  app.get(
    '/:product/:version/:integrationType/manifests',
    manifestRateLimiter,
    cors(),
    listManifests
  );
  app.get(
    '/:product/:version/:integrationType/manifests/latest',
    manifestRateLimiter,
    cors(),
    downloadLatestManifest
  );
  app.get(
    '/:product/:version/:integrationType/manifests/:name',
    manifestRateLimiter,
    cors(),
    downloadManifestByName
  );
};

const streamManifestByName = async (
  res: Response,
  product: PlatformIdentifier,
  version: string,
  name: string
): Promise<void> => {
  if (!isValidManifestName(name)) {
    logApp.error('Manifest name failed validation before MinIO lookup', {
      name,
    });
    res.status(404).json({ code: 404, message: 'Manifest not found' });
    return;
  }

  const key = ManifestHelper.buildManifestObjectKey(product, version, name);
  const body = await MinIOClient.downloadFile(key);
  if (!body) {
    res.status(404).json({ code: 404, message: 'Manifest file not found' });
    return;
  }

  const stream = body as Readable;

  res.setHeader('Content-Type', 'application/json');

  stream.on('error', (error) => {
    logApp.error('Error while streaming manifest', { error });
    if (res.headersSent) {
      res.destroy(error);
    } else {
      res.removeHeader('Cache-Control');
      res.status(404).json({ code: 404, message: 'Manifest file not found' });
    }
  });

  stream.pipe(res);
};

export const downloadLatestManifest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const params = validateManifestParams(req, res);
    if (!params) return;

    const latest = await ManifestDomain.getLatestManifest(
      params.product,
      params.version,
      params.integrationType
    );
    if (!latest) {
      res.status(404).json({ code: 404, message: 'Manifest not found' });
      return;
    }

    res.setHeader('Cache-Control', 'no-cache');
    await streamManifestByName(
      res,
      params.product,
      params.version,
      latest.name
    );
  } catch (error) {
    logApp.error('Error while retrieving latest manifest', { error });
    if (res.headersSent) {
      res.destroy(error as Error);
      return;
    }
    res.status(500).json({ code: 500, message: 'Internal server error' });
  }
};

export const downloadManifestByName = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const params = validateManifestParams(req, res);
    if (!params) return;

    const { name } = req.params;
    if (typeof name !== 'string' || !isValidManifestName(name)) {
      res.status(400).json({ code: 400, message: 'Invalid manifest name' });
      return;
    }

    const manifest = await ManifestDomain.getManifestByName(
      params.product,
      params.version,
      params.integrationType,
      name
    );
    if (!manifest) {
      res.status(404).json({ code: 404, message: 'Manifest not found' });
      return;
    }

    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    await streamManifestByName(
      res,
      params.product,
      params.version,
      manifest.name
    );
  } catch (error) {
    logApp.error('Error while retrieving manifest by name', { error });
    if (res.headersSent) {
      res.destroy(error as Error);
      return;
    }
    res.status(500).json({ code: 500, message: 'Internal server error' });
  }
};
