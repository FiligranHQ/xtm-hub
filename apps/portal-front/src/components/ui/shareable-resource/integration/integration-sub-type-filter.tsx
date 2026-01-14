import { ServiceListFilterContainer } from '@/components/service/components/header/filter/service-list-filter-container';
import {
  ServiceListLocalStorageKey,
  useServiceListLocalStorage,
} from '@/components/service/components/use-service-list-local-storage';
import { getIntegrationSubTypeMetadata } from '@/components/service/integrations/integration.utils';
import { MultiSelectFormField } from '@filigran/ui';
import { IntegrationSubTypeEnum } from '@generated/models/IntegrationSubType.enum';
import { useTranslations } from 'next-intl';
import React, { useMemo } from 'react';

export const IntegrationSubTypeFilter: React.FC = () => {
  const { integrationSubTypes, setIntegrationSubTypes } =
    useServiceListLocalStorage(
      ServiceListLocalStorageKey.OpenCTIIntegrationFeeds
    );
  const t = useTranslations();

  const onIntegrationSubTypeChange = (v: IntegrationSubTypeEnum[]) => {
    setIntegrationSubTypes(v);
  };

  const options = useMemo(() => {
    return Object.keys(IntegrationSubTypeEnum)
      .map((integrationSubType) => ({
        label: getIntegrationSubTypeMetadata(integrationSubType)?.label ?? '',
        value: integrationSubType.toString(),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  return (
    <ServiceListFilterContainer>
      <MultiSelectFormField
        options={options}
        defaultValue={integrationSubTypes}
        placeholder={t(
          'Service.OpenctiIntegrations.Filter.IntegrationSubType.Placeholder'
        )}
        noResultString={t('Utils.NotFound')}
        onValueChange={(values) =>
          onIntegrationSubTypeChange(values as IntegrationSubTypeEnum[])
        }
        variant="inverted"
      />
    </ServiceListFilterContainer>
  );
};
