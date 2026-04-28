import { getUseCases } from '@/components/admin/use-case/use-case.utils';
import { useTranslations } from 'next-intl';
import { FunctionComponent } from 'react';
import { useServiceListFilters } from '../../../../../hooks/use-service-list-filters';
import { useServiceListLocalStorage } from '../../../../../hooks/use-service-list-local-storage';
import { LogicalMultiSelectFormField } from '../../../../ui/shareable-resource/logical-multi-select/LogicalMultiSelectFormField';
import { useServiceListLocalStorageKeyContext } from '../../ServiceListLocalStorageKeyContext';
import { ServiceListFilterKey } from '../ServiceListHeader';

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

  const labelOptions = getUseCases(type).map(({ name, id }) => ({
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
