import ConnectorsList from '@/components/connectors/connectors-list';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { getConnectorManifest } from '@/utils/connectors/connectors.fetch';

export const metadata = {
  title: 'OpenCTI Connectors Releases',
  description: 'View all releases of OpenCTI Connectors',
};

export default async function Page() {
  const connectorManifest = await getConnectorManifest('master');
  return (
    <main>
      <h1 className="leading-tight my-8 md:my-16 text-center text-[2.5rem] md:text-[3.5rem]">
        {connectorManifest.name}
      </h1>

      <ConnectorsList contracts={connectorManifest.contracts} />
    </main>
  );
}
