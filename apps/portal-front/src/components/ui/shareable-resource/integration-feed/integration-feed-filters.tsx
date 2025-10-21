import { getIngestionConnectorMetadata } from '@/components/connectors/connector.utils';
import { ServiceListFilterContainer } from '@/components/service/components/service-list-filter-container';
import { serviceListLocalStorage } from '@/components/service/components/service-list-localstorage';
import { ConnectorTypeEnum } from '@generated/models/ConnectorType.enum';
import { IntegrationFeedTypeEnum } from '@generated/models/IntegrationFeedType.enum';
import { MultiSelectFormField } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import React, { useMemo } from 'react';

interface Props {
  onIntegrationFeedTypeChange: (v: IntegrationFeedTypeEnum[]) => void;
  onConnectorTypeChange: (v: ConnectorTypeEnum[]) => void;
}

export const IntegrationFeedFilters: React.FC<Props> = ({
  onIntegrationFeedTypeChange,
  onConnectorTypeChange,
}) => {
  const { integrationTypes, connectorTypes } =
    serviceListLocalStorage('csvFeed');
  const t = useTranslations();
  const feedTypeOptions = useMemo(() => {
    return Object.values(IntegrationFeedTypeEnum)
      .map((feedType) => ({
        label: t(`Service.OpenctiIntegrationFeeds.Filter.Type.${feedType}`),
        value: feedType,
        disabled: true,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [IntegrationFeedTypeEnum]);

  const connectorTypeOptions = useMemo(() => {
    return Object.keys(ConnectorTypeEnum)
      .map((connectorType) => ({
        label: getIngestionConnectorMetadata(connectorType)?.label ?? '',
        value: connectorType.toString(),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [ConnectorTypeEnum]);

  const shouldDisplayConnectorFilter = integrationTypes.includes(
    IntegrationFeedTypeEnum.CONNECTOR
  );

  return (
    <>
      <ServiceListFilterContainer>
        <MultiSelectFormField
          options={feedTypeOptions}
          defaultValue={integrationTypes}
          placeholder={t(
            'Service.OpenctiIntegrationFeeds.Filter.Type.Placeholder'
          )}
          noResultString={t('Utils.NotFound')}
          onValueChange={(values) =>
            onIntegrationFeedTypeChange(values as IntegrationFeedTypeEnum[])
          }
          variant="inverted"
        />
      </ServiceListFilterContainer>
      {shouldDisplayConnectorFilter && (
        <ServiceListFilterContainer>
          <MultiSelectFormField
            options={connectorTypeOptions}
            defaultValue={connectorTypes}
            placeholder={t(
              'Service.IntegrationFeed.Filter.Connector.Type.Placeholder'
            )}
            noResultString={t('Utils.NotFound')}
            onValueChange={(values) =>
              onConnectorTypeChange(values as ConnectorTypeEnum[])
            }
            variant="inverted"
          />
        </ServiceListFilterContainer>
      )}
    </>
  );
};
