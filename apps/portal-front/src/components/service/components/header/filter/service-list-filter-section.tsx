import { ServiceListFilterItem } from '@/components/service/components/header/filter/service-list-filter-item';
import { ServiceListFilterMap } from '@/components/service/components/header/service-list-header';
import { useServiceListFilters } from '@/components/service/components/use-service-list-filters';
import React, { useMemo } from 'react';

interface Props {
  filters: ServiceListFilterMap;
}

export const ServiceListFilterSection: React.FC<Props> = ({ filters }) => {
  const { selectedFilters } = useServiceListFilters();

  const filtersList = useMemo(() => {
    return selectedFilters.map((selectedFilterKey) => {
      const filter = filters[selectedFilterKey];
      return (
        filter && (
          <ServiceListFilterItem
            key={selectedFilterKey}
            filter={filter}
            selectedFilterKey={selectedFilterKey}
          />
        )
      );
    });
  }, [selectedFilters, filters]);

  return <div className="flex justify-start gap-xxl">{filtersList}</div>;
};
