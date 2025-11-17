import {
  ServiceListFilter,
  ServiceListFilterKey,
} from '@/components/service/components/header/service-list-header';
import { useServiceListFilters } from '@/components/service/components/use-service-list-filters';
import { DeleteIcon } from 'filigran-icon';
import { Button } from 'filigran-ui';
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
    <div className="flex gap-s">
      {filter.node}

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => {
          filter.reset();
          removeFilter(selectedFilterKey);
        }}>
        <DeleteIcon className="h-4 w-4" />
      </Button>
    </div>
  );
};
