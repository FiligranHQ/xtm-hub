import { IntegrationTypeEnum } from '@generated/models/IntegrationType.enum';
import { useTranslations } from 'next-intl';
import React, { useMemo } from 'react';
import { useServiceListFilters } from '../../../../hooks/use-service-list-filters';
import {
  ServiceListLocalStorageKey,
  useServiceListLocalStorage,
} from '../../../../hooks/use-service-list-local-storage';
import { ServiceListFilterKey } from '../../../service/components/header/ServiceListHeader';
import {
  availableIntegrationTypes,
  getIntegrationSubTypeMetadata,
  SubTypesPerIntegrationType,
} from '../../../service/integrations/Integration.utils';
import { LogicalMultiSelectFormField } from '../logical-multi-select/LogicalMultiSelectFormField';

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
      onRemove={removeIntegrationFilter}
    />
  );
};
