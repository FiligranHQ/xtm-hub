import { ConnectorVersionCombobox } from '@/components/connectors/connector-version-combobox';
import { getConnectorVersion } from '@/utils/connectors/connectors.fetch';

export const SelectConnectorVersion = async () => {
  const connectorVersion = await getConnectorVersion();
  const availableVersions = connectorVersion.map(({ version }) => ({
    value: version,
    label: version === 'master' ? 'Latest' : version,
  }));
  return <ConnectorVersionCombobox dataTab={availableVersions} />;
};
