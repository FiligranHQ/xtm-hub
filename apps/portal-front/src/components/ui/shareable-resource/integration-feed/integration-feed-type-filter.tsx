import { ServiceListFilterContainer } from '@/components/service/components/header/filter/service-list-filter-container';
import {
  ServiceListLocalStorageKey,
  useServiceListLocalStorage,
} from '@/components/service/components/use-service-list-local-storage';
import { IntegrationFeedTypeEnum } from '@generated/models/IntegrationFeedType.enum';
import { MultiSelectFormField } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import React, { useMemo } from 'react';

export const IntegrationFeedTypeFilter: React.FC = () => {
  const { integrationTypes, setIntegrationTypes, removeConnectorTypes } =
    useServiceListLocalStorage(
      ServiceListLocalStorageKey.OpenCTIIntegrationFeeds
    );
  const t = useTranslations();

  const onIntegrationTypeChange = (v: IntegrationFeedTypeEnum[]) => {
    const hasConnectorType = v.includes(IntegrationFeedTypeEnum.CONNECTOR);
    if (!hasConnectorType) {
      removeConnectorTypes();
    }
    setIntegrationTypes(v);
  };

  const options = useMemo(() => {
    return Object.values(IntegrationFeedTypeEnum)
      .map((feedType) => ({
        label: t(`Service.OpenctiIntegrationFeeds.Filter.Type.${feedType}`),
        value: feedType.toString(),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [IntegrationFeedTypeEnum]);

  return (
    <ServiceListFilterContainer>
      <MultiSelectFormField
        options={options}
        defaultValue={integrationTypes}
        placeholder={t(
          'Service.OpenctiIntegrationFeeds.Filter.Type.Placeholder'
        )}
        noResultString={t('Utils.NotFound')}
        onValueChange={(values) =>
          onIntegrationTypeChange(values as IntegrationFeedTypeEnum[])
        }
        variant="inverted"
      />
    </ServiceListFilterContainer>
  );
};
