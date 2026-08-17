import { ServiceListFilterKey } from '@/components/service/components/header/ServiceListHeader';
import { useServiceListLocalStorageKeyContext } from '@/components/service/components/ServiceListLocalStorageKeyContext';
import { useSolutionCategories } from '@/components/service/form/UseSolutionCategories';
import { LogicalMultiSelectFormField } from '@/components/ui/shareable-resource/logical-multi-select/LogicalMultiSelectFormField';
import { useServiceListFilters } from '@/hooks/use-service-list-filters';
import { useServiceListLocalStorage } from '@/hooks/use-service-list-local-storage';
import { FiligranProduct } from '@graphql/generated';
import { useMemo } from 'react';

import { useTranslate } from '@tolgee/react';
export const IntegrationSolutionCategoryFilter = () => {
  const { t } = useTranslate();
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
        'Service_OpenctiIntegrations_Filter_SolutionCategory_Placeholder'
      )}
      noResultString={t('Utils_NotFound')}
      onValueChange={setSolutionCategories}
      onRemove={removeSolutionCategoryFilter}
      optionLabel={t(
        'Service_OpenctiIntegrations_Filter_SolutionCategory_Label'
      )}
    />
  );
};
