import {
  ServiceListFilter,
  ServiceListFilterKey,
} from '@/components/service/components/header/service-list-header';
import { useServiceListFilters } from '@/components/service/components/use-service-list-filters';
import { CancelIcon } from '@filigran/icon';
import { Button } from '@filigran/ui/servers';
import React from 'react';

interface Props {
  selectedFilterKey: ServiceListFilterKey;
  filter: ServiceListFilter;
}

export const ServiceListFilterItem: React.FC<Props> = ({
  selectedFilterKey,
  filter,
}) => {
  const { removeFilter } = useServiceListFilters();
  return (
    <div className="flex">
      {filter.node}

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => {
          filter.reset();
          removeFilter(selectedFilterKey);
        }}>
        <CancelIcon className="h-6 w-6 text-gray/60 ml-xs pr-xs" />
      </Button>
    </div>
  );
};
