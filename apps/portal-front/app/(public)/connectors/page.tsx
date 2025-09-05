import ConnectorContractCard from '@/components/connectors/connector-contract-card';
import { getConnectorManifest } from '@/utils/connectors/connectors.fetch';

export const metadata = {
  title: 'OpenCTI Connectors Releases',
  description: 'View all releases of OpenCTI Connectors',
};

export default async function Page() {
  const connectorManifest = await getConnectorManifest('master');
  return (
    <main>
      <h1 className="py-m">{connectorManifest.name}</h1>
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-l">
        {connectorManifest.contracts.map((contract) => (
          <ConnectorContractCard
            key={contract.slug}
            contract={contract}
          />
        ))}
      </section>
    </main>
  );
}
