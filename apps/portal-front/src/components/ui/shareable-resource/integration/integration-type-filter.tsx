import { ServiceListFilterContainer } from '@/components/service/components/header/filter/service-list-filter-container';
import {
  ServiceListLocalStorageKey,
  useServiceListLocalStorage,
} from '@/components/service/components/use-service-list-local-storage';
import { availableIntegrationTypes } from '@/components/service/integrations/integration.utils';
import { MultiSelectFormField } from '@filigran/ui';
import { IntegrationTypeEnum } from '@generated/models/IntegrationType.enum';
import { useTranslations } from 'next-intl';
import React, { useMemo } from 'react';

export const IntegrationTypeFilter: React.FC = () => {
  const { integrationTypes, setIntegrationTypes, removeIntegrationSubTypes } =
    useServiceListLocalStorage(
      ServiceListLocalStorageKey.OpenCTIIntegrationFeeds
    );
  const t = useTranslations();

  const onIntegrationTypeChange = (v: IntegrationTypeEnum[]) => {
    const hasIntegrationSubTypeFilter =
      v.includes(IntegrationTypeEnum.CONNECTOR) ||
      v.includes(IntegrationTypeEnum.TAXII_FEED);
    if (!hasIntegrationSubTypeFilter) {
      removeIntegrationSubTypes();
    }
    setIntegrationTypes(v);
  };

  const options = useMemo(() => {
    const allOptions = Object.values(IntegrationTypeEnum).map((feedType) => ({
      label: t(`Service.OpenctiIntegrations.Type.${feedType}`),
      value: feedType.toString(),
    }));
    const availableOption = allOptions
      .filter((option) =>
        availableIntegrationTypes.includes(option.value as IntegrationTypeEnum)
      )
      .sort((a, b) => a.label.localeCompare(b.label));
    const comingSoonOption = allOptions
      .filter(
        (option) =>
          !availableIntegrationTypes.includes(
            option.value as IntegrationTypeEnum
          )
      )
      .sort((a, b) => a.label.localeCompare(b.label));
    return [...availableOption, ...comingSoonOption];
  }, [t]);

  return (
    <ServiceListFilterContainer>
      <MultiSelectFormField
        options={options}
        defaultValue={integrationTypes}
        placeholder={t('Service.OpenctiIntegrations.Filter.Type.Placeholder')}
        noResultString={t('Utils.NotFound')}
        onValueChange={(values) =>
          onIntegrationTypeChange(values as IntegrationTypeEnum[])
        }
        variant="inverted"
      />
    </ServiceListFilterContainer>
  );
};
