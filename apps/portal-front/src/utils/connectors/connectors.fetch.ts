import { Connector } from '@/utils/connectors/connector.model';
import fs from 'fs/promises';
import path from 'path';
import semver from 'semver/preload';
export interface GithubRelease {
  tag_name: string;
}
export const getConnectorVersion = async () => {
  const releases: GithubRelease[] = await fetch(
    'https://api.github.com/repos/OpenCTI-Platform/connectors/releases',
    {
      next: {
        tags: ['connectors'],
      },
    }
  ).then((res) => res.json());
  const versions = releases
    .map((release) => ({
      version: String(release.tag_name),
    }))
    .filter(
      (release) =>
        release.version !== null && semver.gte(release.version, '6.7.16')
    );
  return [{ version: 'master' }, ...versions];
};

export const getConnectorManifest = async (
  version: string = 'master'
): Promise<Connector> => {
  const cacheDir = path.join(process.cwd(), '.cache');
  const cacheFile = path.join(cacheDir, `connector-${version}.json`);

  try {
    const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const stats = await fs.stat(cacheFile);
    const isExpired = Date.now() - stats.mtime.getTime() > CACHE_DURATION;

    if (!isExpired) {
      const cached = await fs.readFile(cacheFile, 'utf-8');
      return JSON.parse(cached);
    }
  } catch (e) {
    console.warn('Expired data: ', e);
  }

  // Fetch fresh data
  const response = await fetch(
    `https://raw.githubusercontent.com/OpenCTI-Platform/connectors/${version}/manifest.json`
  );
  const data = await response.json();

  // Save to cache
  await fs.mkdir(cacheDir, { recursive: true });
  await fs.writeFile(cacheFile, JSON.stringify(data));

  return data;
};
