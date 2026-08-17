import { useUseCases } from '@/components/admin/use-case/use-use-cases';
import { useServiceListLocalStorageKeyContext } from '@/components/service/components/ServiceListLocalStorageKeyContext';
import { ServiceListFilterKey } from '@/components/service/components/header/ServiceListHeader';
import { LogicalMultiSelectFormField } from '@/components/ui/shareable-resource/logical-multi-select/LogicalMultiSelectFormField';
import { useServiceListFilters } from '@/hooks/use-service-list-filters';
import { useServiceListLocalStorage } from '@/hooks/use-service-list-local-storage';

import { useTranslate } from '@tolgee/react';
interface ServiceListFilterLabelProps {
  type: string;
}
export const ServiceListFilterLabel = ({
  type,
}: ServiceListFilterLabelProps) => {
  const { t } = useTranslate();
  const { localStorageKey } = useServiceListLocalStorageKeyContext();
  const { labels, setLabels, removeLabels } =
    useServiceListLocalStorage(localStorageKey);

  const { removeFilter } = useServiceListFilters();
  const removeLabelFilter = () => {
    removeLabels();
    removeFilter(ServiceListFilterKey.Label);
  };

  const labelOptions = useUseCases({ documentType: type }).map(
    ({ name, id }) => ({
      label: name,
      value: id,
    })
  );

  return (
    <LogicalMultiSelectFormField
      options={labelOptions}
      initialValue={labels}
      placeholder={t('GenericActions_FilterUseCases')}
      noResultString={t('Utils_NotFound')}
      onValueChange={setLabels}
      onRemove={removeLabelFilter}
      optionLabel={t('GenericActions_FilterUseCasesLabel')}
    />
  );
};
