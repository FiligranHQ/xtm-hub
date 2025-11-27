import { getLabels } from '@/components/admin/label/label.utils';
import { ServiceListFilterContainer } from '@/components/service/components/header/filter/service-list-filter-container';
import { useServiceContext } from '@/components/service/components/service-context';
import { useServiceListLocalStorageKeyContext } from '@/components/service/components/service-list-local-storage-key-context';
import { useServiceListLocalStorage } from '@/components/service/components/use-service-list-local-storage';
import { MultiSelectFormField } from 'filigran-ui/clients';
import { useTranslations } from 'next-intl';
import React from 'react';

export const ServiceListFilterLabel: React.FC = () => {
  const t = useTranslations();
  const { localStorageKey } = useServiceListLocalStorageKeyContext();
  const { labels, setLabels } = useServiceListLocalStorage(localStorageKey);
  const { type } = useServiceContext();

  const labelOptions = getLabels(type).map(({ name, id }) => ({
    label: name,
    value: id,
  }));

  return (
    <ServiceListFilterContainer>
      <MultiSelectFormField
        options={labelOptions}
        defaultValue={labels}
        placeholder={t('GenericActions.FilterUseCases')}
        noResultString={t('Utils.NotFound')}
        onValueChange={setLabels}
        variant="inverted"
      />
    </ServiceListFilterContainer>
  );
};
