import { ServiceListFilterKey } from '@/components/service/components/header/service-list-header';
import { useServiceListFilters } from '@/components/service/components/use-service-list-filters';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from 'filigran-ui';
import { useTranslations } from 'next-intl';
import React, { useMemo } from 'react';

interface Props {
  filterKeys: ServiceListFilterKey[];
}

export const ServiceListAddFilterDropdown: React.FC<Props> = ({
  filterKeys,
}) => {
  const t = useTranslations();
  const { addFilter, selectedFilters } = useServiceListFilters();
  const availableFilterKeys = useMemo(() => {
    return filterKeys.filter((key) => !selectedFilters.includes(key));
  }, [filterKeys, selectedFilters]);

  const menuItems = useMemo(() => {
    if (!availableFilterKeys.length) {
      return (
        <DropdownMenuItem
          disabled
          aria-label={t('Service.List.Filter.NoOptions')}>
          {t('Service.List.Filter.NoOptions')}
        </DropdownMenuItem>
      );
    }

    return availableFilterKeys.map((filterKey) => (
      <DropdownMenuItem
        key={filterKey}
        aria-label={t(`Service.List.Filter.Key.${filterKey}`)}
        onClick={() => addFilter(filterKey)}>
        {t(`Service.List.Filter.Key.${filterKey}`)}
      </DropdownMenuItem>
    ));
  }, [availableFilterKeys, addFilter, t]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          aria-label={t('Service.List.Filter.Add')}>
          {t('Service.List.Filter.Add')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">{menuItems}</DropdownMenuContent>
    </DropdownMenu>
  );
};
