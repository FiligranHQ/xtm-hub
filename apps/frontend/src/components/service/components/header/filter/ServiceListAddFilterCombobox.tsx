import { ServiceListFilterKey } from '@/components/service/components/header/ServiceListHeader';
import { useServiceListFilters } from '@/hooks/use-service-list-filters';
import { Combobox } from '@filigran/ui/clients';
import { useTranslate } from '@tolgee/react';
import { useMemo } from 'react';
interface ServiceListAddFilterComboboxProps {
  filterKeys: ServiceListFilterKey[];
}

export const ServiceListAddFilterCombobox = ({
  filterKeys,
}: ServiceListAddFilterComboboxProps) => {
  const { t } = useTranslate();
  const { addFilter, selectedFilters } = useServiceListFilters();
  const availableFilterKeys = useMemo(() => {
    return filterKeys.filter((key) => !selectedFilters.includes(key));
  }, [filterKeys, selectedFilters]);

  const dataTab = useMemo(() => {
    return availableFilterKeys.map((filterKey) => ({
      value: filterKey,
      label: t(`Service_List_Filter_Key_${filterKey}`),
    }));
  }, [availableFilterKeys, t]);

  return (
    <Combobox
      className="w-[190px]"
      dataTab={dataTab}
      order={t('Service_List_Filter_Add')}
      placeholder={t('Service_List_Filter_Add')}
      emptyCommand={t('Service_List_Filter_NoOptions')}
      onValueChange={(v) => v?.value && addFilter(v.value)}
    />
  );
};
