import { getLabels } from '@/components/admin/label/label.utils';
import { ServiceListFilterKey } from '@/components/service/components/header/service-list-header';
import { useServiceListLocalStorageKeyContext } from '@/components/service/components/service-list-local-storage-key-context';
import { useServiceListFilters } from '@/components/service/components/use-service-list-filters';
import { useServiceListLocalStorage } from '@/components/service/components/use-service-list-local-storage';
import { LogicalMultiSelectFormField } from '@/components/ui/shareable-resource/logical-multi-select-form-field';
import { useTranslations } from 'next-intl';
import { FunctionComponent } from 'react';

interface ServiceListFilterLabelProps {
  type: string;
}
export const ServiceListFilterLabel: FunctionComponent<
  ServiceListFilterLabelProps
> = ({ type }) => {
  const t = useTranslations();
  const { localStorageKey } = useServiceListLocalStorageKeyContext();
  const { labels, setLabels, removeLabels } =
    useServiceListLocalStorage(localStorageKey);

  const { removeFilter } = useServiceListFilters();
  const removeLabelFilter = () => {
    removeLabels();
    removeFilter(ServiceListFilterKey.Label);
  };

  const labelOptions = getLabels(type).map(({ name, id }) => ({
    label: name,
    value: id,
  }));

  return (
    <LogicalMultiSelectFormField
      options={labelOptions}
      initialValue={labels}
      placeholder={t('GenericActions.FilterUseCases')}
      noResultString={t('Utils.NotFound')}
      onValueChange={setLabels}
      onRemove={removeLabelFilter}
      optionLabel={t('GenericActions.FilterUseCasesLabel')}
    />
  );
};
