import { getIngestionConnectorMetadata } from '@/components/connectors/connector.utils';
import { ServiceListFilterContainer } from '@/components/service/components/header/filter/service-list-filter-container';
import {
  ServiceListLocalStorageKey,
  useServiceListLocalStorage,
} from '@/components/service/components/use-service-list-local-storage';
import { MultiSelectFormField } from '@filigran/ui';
import { ConnectorTypeEnum } from '@generated/models/ConnectorType.enum';
import { useTranslations } from 'next-intl';
import React, { useMemo } from 'react';

export const IntegrationConnectorTypeFilter: React.FC = () => {
  const { connectorTypes, setConnectorTypes } = useServiceListLocalStorage(
    ServiceListLocalStorageKey.OpenCTIIntegrationFeeds
  );
  const t = useTranslations();

  const onConnectorTypeChange = (v: ConnectorTypeEnum[]) => {
    setConnectorTypes(v);
  };

  const options = useMemo(() => {
    return Object.keys(ConnectorTypeEnum)
      .map((connectorType) => ({
        label: getIngestionConnectorMetadata(connectorType)?.label ?? '',
        value: connectorType.toString(),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [ConnectorTypeEnum]);

  return (
    <ServiceListFilterContainer>
      <MultiSelectFormField
        options={options}
        defaultValue={connectorTypes}
        placeholder={t(
          'Service.OpenctiIntegrations.Filter.Connector.Type.Placeholder'
        )}
        noResultString={t('Utils.NotFound')}
        onValueChange={(values) =>
          onConnectorTypeChange(values as ConnectorTypeEnum[])
        }
        variant="inverted"
      />
    </ServiceListFilterContainer>
  );
};
