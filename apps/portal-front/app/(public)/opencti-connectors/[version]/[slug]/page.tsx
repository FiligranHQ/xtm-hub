import ContractDetailPage from '@/components/connectors/contract-detail-page';
import { Connector, Contract } from '@/utils/connectors/connector.model';
import { getConnectorManifest } from '@/utils/connectors/connectors.fetch';

export const metadata = {
  title: 'OpenCTI Connectors Releases',
  description: 'View all releases of OpenCTI Connectors',
};

export default async function Page({
  params,
}: {
  params: Promise<{ version: string; slug: string }>;
}) {
  const { version, slug } = await params;
  const connectorManifest: Connector = await getConnectorManifest(version);
  const connectorContract: Contract | undefined =
    connectorManifest.contracts.find((contract) => contract.slug === slug);
  return (
    <main>
      {connectorContract && <ContractDetailPage contract={connectorContract} />}
    </main>
  );
}
