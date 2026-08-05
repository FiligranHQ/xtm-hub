import { ServiceListFilterKey } from '@/components/service/components/header/ServiceListHeader';
import {
  availableIntegrationTypes,
  getIntegrationSubTypeMetadata,
  SubTypesPerIntegrationType,
} from '@/components/service/integrations/Integration.utils';
import { LogicalMultiSelectFormField } from '@/components/ui/shareable-resource/logical-multi-select/LogicalMultiSelectFormField';
import { useIsFeatureEnabled } from '@/hooks/use-is-feature-enabled';
import { useServiceListFilters } from '@/hooks/use-service-list-filters';
import {
  ServiceListLocalStorageKey,
  useServiceListLocalStorage,
} from '@/hooks/use-service-list-local-storage';
import { FeatureFlag, IntegrationType } from '@graphql/generated';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

interface IntegrationTypeFilterProps {
  isSolutionCategoriesEnabled?: boolean;
}

export const IntegrationTypeFilter = ({
  isSolutionCategoriesEnabled,
}: IntegrationTypeFilterProps = {}) => {
  const { integrationTypes, setIntegrationTypes, removeIntegrationTypes } =
    useServiceListLocalStorage(
      ServiceListLocalStorageKey.OpenCTIIntegrationFeeds
    );
  const isSolutionCategoriesFeatureEnabled = useIsFeatureEnabled(
    FeatureFlag.SolutionCategories
  );
  const shouldHideSubtypes =
    isSolutionCategoriesEnabled ?? isSolutionCategoriesFeatureEnabled;
  const { removeFilter } = useServiceListFilters();
  const t = useTranslations();

  const options = useMemo(() => {
    const allOptions = Object.values(IntegrationType).map((feedType) => ({
      label: t(`Service.OpenctiIntegrations.Type.${feedType}`),
      value: feedType.toString(),
      children: shouldHideSubtypes
        ? undefined
        : (SubTypesPerIntegrationType.get(feedType)?.map((subtype) => ({
            label: getIntegrationSubTypeMetadata(subtype)?.label ?? '',
            value: subtype.toString(),
          })) ?? undefined),
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
  }, [shouldHideSubtypes, t]);

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
