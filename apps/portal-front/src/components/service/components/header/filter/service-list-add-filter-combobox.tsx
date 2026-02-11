import { ServiceListFilterKey } from '@/components/service/components/header/service-list-header';
import { useServiceListFilters } from '@/components/service/components/use-service-list-filters';
import { Combobox } from '@filigran/ui/clients';
import { useTranslations } from 'next-intl';
import React, { useMemo } from 'react';

interface Props {
  filterKeys: ServiceListFilterKey[];
}

export const ServiceListAddFilterCombobox: React.FC<Props> = ({
  filterKeys,
}) => {
  const t = useTranslations();
  const { addFilter, selectedFilters } = useServiceListFilters();
  const availableFilterKeys = useMemo(() => {
    return filterKeys.filter((key) => !selectedFilters.includes(key));
  }, [filterKeys, selectedFilters]);

  const dataTab = useMemo(() => {
    return availableFilterKeys.map((filterKey) => ({
      value: filterKey,
      label: t(`Service.List.Filter.Key.${filterKey}`),
    }));
  }, [availableFilterKeys, t]);

  return (
    <Combobox
      className="w-[150px]"
      dataTab={dataTab}
      order={t('Service.List.Filter.Add')}
      placeholder={t('Service.List.Filter.Add')}
      emptyCommand={t('Service.List.Filter.NoOptions')}
      onValueChange={(v) => v?.value && addFilter(v.value)}
    />
  );
};
