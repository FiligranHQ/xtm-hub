import { Connector } from '@/utils/connectors/connector.model';
import semver from 'semver/preload';
import { GithubRelease } from '../../../app/(public)/cybersecurity-solutions/opencti-connectors/[version]/page';

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
    .slice(0, 3); // Need to use semver to compare version
  return [{ version: 'master' }, ...versions];
};

export const getConnectorManifest = async (
  version: string
): Promise<Connector> => {
  return await fetch(
    `https://raw.githubusercontent.com/OpenCTI-Platform/connectors/${version}/manifest.json`,
    {
      next: {
        tags: ['connectors'],
      },
    }
  ).then((res) => res.json());
};
