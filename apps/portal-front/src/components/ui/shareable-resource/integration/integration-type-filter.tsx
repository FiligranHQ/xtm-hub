import { ServiceListFilterKey } from '@/components/service/components/header/service-list-header';
import { useServiceListFilters } from '@/components/service/components/use-service-list-filters';
import {
  ServiceListLocalStorageKey,
  useServiceListLocalStorage,
} from '@/components/service/components/use-service-list-local-storage';
import {
  availableIntegrationTypes,
  getIntegrationSubTypeMetadata,
  SubTypesPerIntegrationType,
} from '@/components/service/integrations/integration.utils';
import { IntegrationTypeEnum } from '@generated/models/IntegrationType.enum';
import { useTranslations } from 'next-intl';
import React, { useMemo } from 'react';
import { LogicalMultiSelectFormField } from '../logical-multi-select/logical-multi-select-form-field';

export const IntegrationTypeFilter: React.FC = () => {
  const { integrationTypes, setIntegrationTypes, removeIntegrationTypes } =
    useServiceListLocalStorage(
      ServiceListLocalStorageKey.OpenCTIIntegrationFeeds
    );
  const { removeFilter } = useServiceListFilters();
  const t = useTranslations();

  const options = useMemo(() => {
    const allOptions = Object.values(IntegrationTypeEnum).map((feedType) => ({
      label: t(`Service.OpenctiIntegrations.Type.${feedType}`),
      value: feedType.toString(),
      children:
        SubTypesPerIntegrationType.get(feedType)?.map((subtype) => ({
          label: getIntegrationSubTypeMetadata(subtype)?.label ?? '',
          value: subtype.toString(),
        })) ?? undefined,
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

  const removeIntegrationFilter = () => {
    removeIntegrationTypes();
    removeFilter(ServiceListFilterKey.IntegrationType);
  };

  return (
    <LogicalMultiSelectFormField
      options={options}
      initialValue={integrationTypes}
      placeholder={t('Service.OpenctiIntegrations.Filter.Type.Placeholder')}
      noResultString={t('Utils.NotFound')}
      onValueChange={setIntegrationTypes}
      optionLabel={t('Service.OpenctiIntegrations.Filter.Type.Label')}
      childOptionLabel={t(
        'Service.OpenctiIntegrations.Filter.IntegrationSubType.Label'
      )}
      onRemove={removeIntegrationFilter}
    />
  );
};
