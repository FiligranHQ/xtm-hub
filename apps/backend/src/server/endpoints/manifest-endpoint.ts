import cors from 'cors';
import { Express, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { Readable } from 'stream';
import { PlatformIdentifier } from '../../__generated__/resolvers-types';
import { ManifestDomain } from '../../modules/shareable-resource/manifest/manifest.domain';
import { ManifestHelper } from '../../modules/shareable-resource/manifest/manifest.helper';
import { MinIOClient } from '../../thirdparty/minio/client';
import { logApp } from '../../utils/app-logger.util';
import {
  isValidManifestName,
  parseCount,
  validateManifestParams,
} from './manifest-endpoint.utils';

const MANIFEST_RATE_WINDOW_MS = 60 * 1000;
const MANIFEST_RATE_MAX = 300;

const manifestRateLimiter = rateLimit({
  windowMs: MANIFEST_RATE_WINDOW_MS,
  max: MANIFEST_RATE_MAX,
  standardHeaders: true,
  legacyHeaders: false,
});

export const ManifestEndpoint = {
  listManifests: async (req: Request, res: Response): Promise<void> => {
    try {
      const validation = validateManifestParams(req.params);
      if (!validation.ok) {
        res.status(400).json({ code: 400, message: validation.message });
        return;
      }
      const { product, version, integrationType } = validation;

      const count = parseCount(req.query.count);
      if (count === undefined) {
        res.status(400).json({ code: 400, message: 'Invalid count' });
        return;
      }

      const manifests = await ManifestDomain.loadManifests(
        product,
        version,
        integrationType,
        count
      );
      res.status(200).json({ manifests });
    } catch (error) {
      logApp.error('Error while listing manifests', { error });
      res.status(500).json({ code: 500, message: 'Internal server error' });
    }
  },

  downloadLatestManifest: async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const validation = validateManifestParams(req.params);
      if (!validation.ok) {
        res.status(400).json({ code: 400, message: validation.message });
        return;
      }
      const { product, version, integrationType } = validation;

      const [latest] = await ManifestDomain.loadManifests(
        product,
        version,
        integrationType,
        1
      );
      if (!latest) {
        logApp.info('No manifest found', {
          product,
          version,
          type: integrationType,
        });
        res.status(404).json({ code: 404, message: 'Manifest not found' });
        return;
      }

      res.setHeader('Cache-Control', 'no-cache');
      await streamManifestByName(res, product, version, latest.name);
    } catch (error) {
      logApp.error('Error while retrieving latest manifest', { error });
      if (res.headersSent) {
        res.destroy(error as Error);
        return;
      }
      res.status(500).json({ code: 500, message: 'Internal server error' });
    }
  },

  downloadManifestByName: async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const validation = validateManifestParams(req.params);
      if (!validation.ok) {
        res.status(400).json({ code: 400, message: validation.message });
        return;
      }
      const { product, version, integrationType } = validation;

      const { name } = req.params;
      if (typeof name !== 'string' || !isValidManifestName(name)) {
        res.status(400).json({ code: 400, message: 'Invalid manifest name' });
        return;
      }

      const manifest = await ManifestDomain.getManifestByName(
        product,
        version,
        integrationType,
        name
      );
      if (!manifest) {
        logApp.info('No manifest found for the requested name', {
          product,
          version,
          type: integrationType,
          name,
        });
        res.status(404).json({ code: 404, message: 'Manifest not found' });
        return;
      }

      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      await streamManifestByName(res, product, version, manifest.name);
    } catch (error) {
      logApp.error('Error while retrieving manifest by name', { error });
      if (res.headersSent) {
        res.destroy(error as Error);
        return;
      }
      res.status(500).json({ code: 500, message: 'Internal server error' });
    }
  },
};
export const manifestEndpoint = (app: Express) => {
  app.get(
    '/:product/:version/:integrationType/manifests',
    manifestRateLimiter,
    cors(),
    ManifestEndpoint.listManifests
  );
  app.get(
    '/:product/:version/:integrationType/manifests/latest',
    manifestRateLimiter,
    cors(),
    ManifestEndpoint.downloadLatestManifest
  );
  app.get(
    '/:product/:version/:integrationType/manifests/:name',
    manifestRateLimiter,
    cors(),
    ManifestEndpoint.downloadManifestByName
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
    logApp.error('Manifest row exists but object is missing in storage', {
      key,
    });
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
