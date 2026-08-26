import { useServiceListLocalStorageKeyContext } from '@/components/service/components/ServiceListLocalStorageKeyContext';
import { ServiceListFilterKey } from '@/components/service/components/header/ServiceListHeader';
import { LogicalMultiSelectFormField } from '@/components/ui/shareable-resource/logical-multi-select/LogicalMultiSelectFormField';
import { useServiceListFilters } from '@/hooks/use-service-list-filters';
import { useServiceListLocalStorage } from '@/hooks/use-service-list-local-storage';
import { useTranslate } from '@/hooks/use-translate';
import { ENTITY_TYPES } from '@/utils/shareable-resources/entity-type';

export const ServiceListFilterEntityType = () => {
  const t = useTranslate();
  const { localStorageKey } = useServiceListLocalStorageKeyContext();
  const { entityTypes, setEntityTypes, removeEntityTypes } =
    useServiceListLocalStorage(localStorageKey);

  const { removeFilter } = useServiceListFilters();
  const removeEntityTypeFilter = () => {
    removeEntityTypes();
    removeFilter(ServiceListFilterKey.EntityType);
  };

  const entityTypeOptions = ENTITY_TYPES.map(({ name, id }) => ({
    label: name,
    value: id,
  }));

  return (
    <LogicalMultiSelectFormField
      options={entityTypeOptions}
      initialValue={entityTypes}
      placeholder={t('GenericActions.FilterEntityTypes')}
      noResultString={t('Utils.NotFound')}
      onValueChange={setEntityTypes}
      onRemove={removeEntityTypeFilter}
      optionLabel={t('GenericActions.FilterEntityTypesLabel')}
    />
  );
};
