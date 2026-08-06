import { ServiceListFilterKey } from '@/components/service/components/header/ServiceListHeader';
import { useServiceListLocalStorageKeyContext } from '@/components/service/components/ServiceListLocalStorageKeyContext';
import { useSolutionCategories } from '@/components/service/form/UseSolutionCategories';
import { LogicalMultiSelectFormField } from '@/components/ui/shareable-resource/logical-multi-select/LogicalMultiSelectFormField';
import { useServiceListFilters } from '@/hooks/use-service-list-filters';
import { useServiceListLocalStorage } from '@/hooks/use-service-list-local-storage';
import { FiligranProduct } from '@graphql/generated';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

export const IntegrationSolutionCategoryFilter = () => {
  const t = useTranslations();
  const categories = useSolutionCategories(FiligranProduct.Opencti);
  const options = useMemo(
    () =>
      categories.map((category) => ({
        label: category.name,
        value: category.id,
      })),
    [categories]
  );

  const { localStorageKey } = useServiceListLocalStorageKeyContext();
  const {
    solutionCategories,
    setSolutionCategories,
    removeSolutionCategories,
  } = useServiceListLocalStorage(localStorageKey);

  const { removeFilter } = useServiceListFilters();
  const removeSolutionCategoryFilter = () => {
    removeSolutionCategories();
    removeFilter(ServiceListFilterKey.SolutionCategory);
  };

  return (
    <LogicalMultiSelectFormField
      options={options}
      initialValue={solutionCategories}
      placeholder={t(
        'Service.OpenctiIntegrations.Filter.SolutionCategory.Placeholder'
      )}
      noResultString={t('Utils.NotFound')}
      onValueChange={setSolutionCategories}
      onRemove={removeSolutionCategoryFilter}
      optionLabel={t(
        'Service.OpenctiIntegrations.Filter.SolutionCategory.Label'
      )}
    />
  );
};
