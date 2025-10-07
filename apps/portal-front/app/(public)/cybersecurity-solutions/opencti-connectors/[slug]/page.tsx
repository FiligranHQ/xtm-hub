import ContractDetailPage from '@/components/connectors/contract-detail-page';
import { Connector, Contract } from '@/utils/connectors/connector.model';
import { getConnectorManifest } from '@/utils/connectors/connectors.fetch';
import { getDefaultMetadata } from '@/utils/generate-metadata';
import { Metadata } from 'next';
import { OpenGraph } from 'next/dist/lib/metadata/types/opengraph-types';
import { Twitter } from 'next/dist/lib/metadata/types/twitter-types';
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

  const metadata = {
    title: `${connectorContract.title} | OpenCTI Connectors`,
    description: connectorContract.short_description,
    keywords: keywords,
  };

  const defaultMetadata = await getDefaultMetadata();
  return {
    ...defaultMetadata,
    ...metadata,
    openGraph: {
      ...defaultMetadata.openGraph,
      ...metadata,
    } as OpenGraph,
    twitter: {
      ...defaultMetadata.twitter,
      ...metadata,
    } as Twitter,
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { metadataBase } = await generateMetadata({ params });
  const connectorManifest: Connector = await getConnectorManifest();
  const connectorContract: Contract | undefined =
    connectorManifest.contracts.find((contract) => contract.slug === slug);
  if (!connectorContract) {
    // notFound() is not working on this dynamic route redirect to 404 for the moment;
    redirect('/404');
  }
  return (
    <main>
      {connectorContract && (
        <ContractDetailPage
          metadataBase={metadataBase?.toString() ?? ''}
          contract={connectorContract}
        />
      )}
    </main>
  );
}
