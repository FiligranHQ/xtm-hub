import { ConnectorVersionCombobox } from '@/components/connectors/connector-version-combobox';
import { getConnectorVersion } from '@/utils/connectors/connectors.fetch';

interface SelectConnectorVersionProps {
  version: string;
}

export const SelectConnectorVersion = async ({
  version,
}: SelectConnectorVersionProps) => {
  const connectorVersion = await getConnectorVersion();
  const availableVersions = connectorVersion.map(({ version }) => ({
    value: version,
    label: version === 'master' ? 'Latest' : version,
  }));
  return (
    <ConnectorVersionCombobox
      version={version}
      dataTab={availableVersions}
    />
  );
};
