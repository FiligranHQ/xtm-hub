import { ServiceListFilterKey } from '@/components/service/components/header/ServiceListHeader';
import {
  availableIntegrationTypes,
  getIntegrationSubTypeMetadata,
  SubTypesPerIntegrationType,
} from '@/components/service/integrations/Integration.utils';
import { LogicalMultiSelectFormField } from '@/components/ui/shareable-resource/logical-multi-select/LogicalMultiSelectFormField';
import { useServiceListFilters } from '@/hooks/use-service-list-filters';
import {
  ServiceListLocalStorageKey,
  useServiceListLocalStorage,
} from '@/hooks/use-service-list-local-storage';
import { IntegrationType } from '@graphql/generated';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

export const IntegrationTypeFilter = () => {
  const { integrationTypes, setIntegrationTypes, removeIntegrationTypes } =
    useServiceListLocalStorage(
      ServiceListLocalStorageKey.OpenCTIIntegrationFeeds
    );
  const { removeFilter } = useServiceListFilters();
  const t = useTranslations();

  const options = useMemo(() => {
    const allOptions = Object.values(IntegrationType).map((feedType) => ({
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
        availableIntegrationTypes.includes(option.value as IntegrationType)
      )
      .sort((a, b) => a.label.localeCompare(b.label));
    const comingSoonOption = allOptions
      .filter(
        (option) =>
          !availableIntegrationTypes.includes(option.value as IntegrationType)
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
