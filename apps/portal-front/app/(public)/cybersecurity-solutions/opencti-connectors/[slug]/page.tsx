import ContractDetailPage from '@/components/connectors/contract-detail-page';
import { Connector, Contract } from '@/utils/connectors/connector.model';
import { getConnectorManifest } from '@/utils/connectors/connectors.fetch';
import { Metadata } from 'next';

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
      robots: {
        index: false,
        follow: false,
      },
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
    authors: [{ name: 'Filigran' }],
    openGraph: {
      title: `${connectorContract.title} | OpenCTI Connectors`,
      description: connectorContract.short_description,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${connectorContract.title} | OpenCTI Connectors`,
      description: connectorContract.short_description,
    },
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
  return (
    <main>
      {connectorContract && <ContractDetailPage contract={connectorContract} />}
    </main>
  );
}
