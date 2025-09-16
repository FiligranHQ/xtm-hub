import ConnectorsList from '@/components/connectors/connectors-list';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { getConnectorManifest } from '@/utils/connectors/connectors.fetch';
import { getDefaultMetadata } from '@/utils/generate-metadata';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { OpenGraph } from 'next/dist/lib/metadata/types/opengraph-types';
import { Twitter } from 'next/dist/lib/metadata/types/twitter-types';

export async function generateMetadata(): Promise<Metadata> {
  const metadata: Metadata = {
    title: 'OpenCTI Connectors Releases',
    description: 'View all releases of OpenCTI Connectors',
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

export default async function Page() {
  const connectorManifest = await getConnectorManifest('master');
  const t = await getTranslations();
  const breadcrumbValue = [
    {
      label: 'MenuLinks.Home',
      href: '/',
    },
    {
      label: 'OpenCTI Connectors',
      href: `/cybersecurity-solutions/opencti-connectors`,
      original: true,
    },
  ];

  return (
    <main>
      <BreadcrumbNav value={breadcrumbValue} />
      <h1 className="leading-tight my-8 md:my-16 text-center text-[2.5rem] md:text-[3.5rem]">
        {t('Service.Connectors.Name')}
      </h1>
      <ConnectorsList contracts={connectorManifest.contracts} />
    </main>
  );
}
