import ConnectorsList from '@/components/connectors/connectors-list';
import { SelectConnectorVersion } from '@/components/connectors/select-version';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { getConnectorManifest } from '@/utils/connectors/connectors.fetch';

export const metadata = {
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
        {connectorManifest.name}
      </h1>
      <div className="grid grid-cols-1 pr-xl mb-l">
        <SelectConnectorVersion />
      </div>
      <ConnectorsList contracts={connectorManifest.contracts} />
    </main>
  );
}
