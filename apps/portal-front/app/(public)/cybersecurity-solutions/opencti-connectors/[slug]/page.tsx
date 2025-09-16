import ContractDetailPage from '@/components/connectors/contract-detail-page';
import { Connector, Contract } from '@/utils/connectors/connector.model';
import { getConnectorManifest } from '@/utils/connectors/connectors.fetch';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export async function generateStaticParams() {
  const connectorManifest: Connector = await getConnectorManifest();

  return connectorManifest.contracts.map((contract) => ({
    slug: contract.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const connectorManifest: Connector = await getConnectorManifest();
  const connectorContract = connectorManifest.contracts.find(
    (contract) => contract.slug === slug
  );

  // Fallback metadata if contract not found
  if (!connectorContract) {
    return {
      title: 'Contract Not Found | OpenCTI Connectors',
      description: 'The requested connector contract could not be found.',
    };
  }

  // Generate keywords from use cases
  const keywords = [
    connectorContract.title,
    'OpenCTI',
    'connector',
    ...connectorContract.use_cases,
    connectorContract.verified ? 'verified' : '',
  ];

  return {
    title: `${connectorContract.title} | OpenCTI Connectors`,
    description: connectorContract.short_description,
    keywords: keywords,
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const connectorManifest: Connector = await getConnectorManifest();
  const connectorContract: Contract | undefined =
    connectorManifest.contracts.find((contract) => contract.slug === slug);
  if (!connectorContract) {
    // notFound() is not working on this dynamic route redirect to 404 for the moment;
    redirect('/404');
  }
  return (
    <main>
      {connectorContract && <ContractDetailPage contract={connectorContract} />}
    </main>
  );
}
