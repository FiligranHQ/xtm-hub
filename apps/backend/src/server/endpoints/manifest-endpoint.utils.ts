import {
  ManifestType,
  PlatformIdentifier,
} from '../../__generated__/resolvers-types';
import { MANIFEST_LIST_DEFAULT_COUNT } from '../../modules/shareable-resource/manifest/manifest.consts';

const MANIFEST_NAME_PATTERN = /^connector-manifest-[A-Za-z0-9.-]+-\d{12}$/;

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

export const isValidManifestName = (value: string): boolean =>
  MANIFEST_NAME_PATTERN.test(value);
