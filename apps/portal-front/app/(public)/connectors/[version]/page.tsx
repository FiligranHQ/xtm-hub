import ConnectorContractCard from '@/components/connectors/connector-contract-card';
import {
  getConnectorManifest,
  getConnectorVersion,
} from '@/utils/connectors/connectors.fetch';

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
      <h1 className="py-m">{connectorManifest.name}</h1>
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-l">
        {connectorManifest.contracts.map((contract) => (
          <ConnectorContractCard
            key={contract.slug}
            contract={contract}
            version={version}
          />
        ))}
      </section>
    </main>
  );
}
