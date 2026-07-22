import type { Request } from 'express';
import {
  ManifestType,
  PlatformIdentifier,
} from '../../__generated__/resolvers-types';
import { ManifestFragmentHelper } from '../../modules/shareable-resource/manifest-fragment/manifest-fragment.helper';
import { MANIFEST_LIST_DEFAULT_COUNT } from '../../modules/shareable-resource/manifest/manifest.consts';

const MANIFEST_NAME_PATTERN = /^connector-manifest-([^/]+)-(\d{12})$/;

export const isProduct = (value: unknown): value is PlatformIdentifier =>
  typeof value === 'string' &&
  (Object.values(PlatformIdentifier) as string[]).includes(value);

export const isIntegrationType = (value: unknown): value is ManifestType =>
  typeof value === 'string' &&
  (Object.values(ManifestType) as string[]).includes(value);

export const parseCount = (raw: unknown): number | undefined => {
  if (raw === undefined) return MANIFEST_LIST_DEFAULT_COUNT;
  if (typeof raw !== 'string') return undefined;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 1) return undefined;
  return parsed;
};

export const isValidManifestName = (value: string): boolean => {
  const match = MANIFEST_NAME_PATTERN.exec(value);
  if (!match) return false;

  try {
    ManifestFragmentHelper.validateAndFormatManifestVersion(match[1] as string);
    return true;
  } catch {
    return false;
  }
};

export type ManifestParamsResult =
  | {
      ok: true;
      product: PlatformIdentifier;
      version: string;
      integrationType: ManifestType;
    }
  | { ok: false; message: string };

export const validateManifestParams = (
  params: Request['params']
): ManifestParamsResult => {
  const { product, version, integrationType } = params;

  if (!isProduct(product)) return { ok: false, message: 'Invalid product' };
  if (!isIntegrationType(integrationType))
    return { ok: false, message: 'Invalid integrationType' };
  if (typeof version !== 'string')
    return { ok: false, message: 'Invalid version' };
  try {
    ManifestFragmentHelper.validateAndFormatManifestVersion(version);
  } catch {
    return { ok: false, message: 'Invalid version format' };
  }

  return { ok: true, product, version, integrationType };
};
