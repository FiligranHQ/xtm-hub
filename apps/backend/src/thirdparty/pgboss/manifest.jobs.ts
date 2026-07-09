import type { ManifestKey } from '../../modules/shareable-resource/manifest/manifest.consts';

export const MANIFEST_QUEUES = {
  REBUILD: 'manifest.rebuild',
  DEAD_LETTER: 'manifest.deadletter',
} as const;

/**
 * How long to wait, after the most recently ingested manifest fragment
 * affecting a given manifest key, before actually regenerating that
 * manifest. Every new fragment for the same key pushes this window out
 * again (trailing-edge debounce), via `ManifestApp.scheduleDebouncedRebuild`.
 */
export const MANIFEST_REBUILD_DEBOUNCE_SECONDS = 60 * 10;

export type ManifestRebuildJobData = ManifestKey;

export const buildManifestRebuildSingletonKey = (key: ManifestKey): string =>
  `${key.platformIdentifier}:${key.version}:${key.type}`;
