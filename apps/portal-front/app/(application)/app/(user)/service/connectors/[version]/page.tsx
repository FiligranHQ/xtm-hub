import {
  getConnectorManifest,
  getConnectorVersion,
} from '@/utils/connectors/connectors.fetch';
import Link from 'next/link';

export interface GithubRelease {
  tag_name: string;
}

export async function generateStaticParams() {
  return await getConnectorVersion();
}

export default async function Page({
  params,
}: {
  params: Promise<{ version: string }>;
}) {
  const { version } = await params;
  const connectorManifest = await getConnectorManifest(version);
  return (
    <main>
      <h1>{connectorManifest.name}</h1>
      <p>{connectorManifest.description}</p>
      {connectorManifest.contracts.map((contract) => (
        <div key={contract.slug}>
          <Link href={`/opencti-connectors/${version}/${contract.slug}`}>
            {contract.title}
          </Link>
        </div>
      ))}
    </main>
  );
}
