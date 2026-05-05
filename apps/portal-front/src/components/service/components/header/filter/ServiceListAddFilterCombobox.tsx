import { ServiceListFilterKey } from '@/components/service/components/header/ServiceListHeader';
import { useServiceListFilters } from '@/hooks/use-service-list-filters';
import { Combobox } from '@filigran/ui/clients';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

interface ServiceListAddFilterComboboxProps {
  filterKeys: ServiceListFilterKey[];
}

export const ServiceListAddFilterCombobox = ({
  filterKeys,
}: ServiceListAddFilterComboboxProps) => {
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
      className="w-[190px]"
      dataTab={dataTab}
      order={t('Service.List.Filter.Add')}
      placeholder={t('Service.List.Filter.Add')}
      emptyCommand={t('Service.List.Filter.NoOptions')}
      onValueChange={(v) => v?.value && addFilter(v.value)}
    />
  );
};
