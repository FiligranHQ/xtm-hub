import ConnectorsList from '@/components/connectors/connectors-list';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { getConnectorManifest } from '@/utils/connectors/connectors.fetch';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'OpenCTI Connectors Releases',
  description: 'View all releases of OpenCTI Connectors',
};

export default async function Page() {
  const connectorManifest = await getConnectorManifest('master');

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
        OpenCTI Connectors
      </h1>
      <ConnectorsList contracts={connectorManifest.contracts} />
    </main>
  );
}
