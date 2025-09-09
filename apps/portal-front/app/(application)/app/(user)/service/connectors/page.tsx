import { getConnectorManifest } from '@/utils/connectors/connectors.fetch';
import Link from 'next/link';

export const metadata = {
  title: 'OpenCTI Connectors Releases',
  description: 'View all releases of OpenCTI Connectors',
};

export default async function Page() {
  const connectorManifest = await getConnectorManifest('master');
  return (
    <main>
      <h1>{connectorManifest.name}</h1>
      <p>{connectorManifest.description}</p>
      {connectorManifest.contracts.map((contract) => (
        <div key={contract.slug}>
          <Link href={`/opencti-connectors/master/${contract.slug}`}>
            {contract.title}
          </Link>
        </div>
      ))}
    </main>
  );
}
