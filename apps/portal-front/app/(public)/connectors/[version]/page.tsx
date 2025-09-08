import ConnectorsList from '@/components/connectors/connectors-list';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import {
  getConnectorManifest,
  getConnectorVersion,
} from '@/utils/connectors/connectors.fetch';

export interface GithubRelease {
  tag_name: string;
}

export async function generateStaticParams() {
  return await getConnectorVersion();
}

export default async function Page({
  params,
}: {
  params: Promise<{ version: string }>;
}) {
  const { version } = await params;
  const connectorManifest = await getConnectorManifest(version);
  return (
    <main>
      <h1 className="leading-tight my-8 md:my-16 text-center text-[2.5rem] md:text-[3.5rem]">
        {connectorManifest.name}
      </h1>
      <ConnectorsList contracts={connectorManifest.contracts} />
    </main>
  );
}
