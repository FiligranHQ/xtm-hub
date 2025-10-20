import {
  getIngestionConnectorMetadata,
  IngestionConnectorType,
} from '@/components/connectors/connector.utils';
import { ServiceListFilterContainer } from '@/components/service/components/service-list-filter-container';
import { serviceListLocalStorage } from '@/components/service/components/service-list-localstorage';
import { ConnectorTypeEnum } from '@generated/models/ConnectorType.enum';
import { IntegrationFeedTypeEnum } from '@generated/models/IntegrationFeedType.enum';
import { MultiSelectFormField } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import React, { useMemo } from 'react';

interface Props {
  onIntegrationFeedTypeChange: (v: IntegrationFeedTypeEnum[]) => void;
  onConnectorTypeChange: (v: IngestionConnectorType[]) => void;
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
      .map((opt) => ({
        label: t(`Service.OpenctiIntegrationFeeds.Filter.Type.${opt}`),
        value: opt,
        disabled: true,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [IntegrationFeedTypeEnum]);

  const connectorTypeOptions = useMemo(() => {
    return Object.keys(ConnectorTypeEnum)
      .map((optKey) => ({
        label: getIngestionConnectorMetadata(optKey).label,
        value: optKey.toString(),
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
              onConnectorTypeChange(values as IngestionConnectorType[])
            }
            variant="inverted"
          />
        </ServiceListFilterContainer>
      )}
    </>
  );
};
