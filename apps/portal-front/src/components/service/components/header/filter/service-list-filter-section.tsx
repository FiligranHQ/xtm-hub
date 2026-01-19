import { ServiceListFilterItem } from '@/components/service/components/header/filter/service-list-filter-item';
import { ServiceListFilterMap } from '@/components/service/components/header/service-list-header';
import { useServiceListFilters } from '@/components/service/components/use-service-list-filters';
import { AndSeparator } from '@/components/ui/shareable-resource/logical-multi-select-form-field';
import React, { useMemo } from 'react';

interface Props {
  filters: ServiceListFilterMap;
}

export const ServiceListFilterSection: React.FC<Props> = ({ filters }) => {
  const { selectedFilters } = useServiceListFilters();

  const filtersList = useMemo(() => {
    return selectedFilters.map((selectedFilterKey, index) => {
      const filter = filters[selectedFilterKey];
      return (
        filter && (
          <React.Fragment key={selectedFilterKey}>
            {index > 0 && <AndSeparator />}
            <ServiceListFilterItem
              filter={filter}
              selectedFilterKey={selectedFilterKey}
            />
          </React.Fragment>
        )
      );
    });
  }, [selectedFilters, filters]);

  return (
    <div className="flex justify-start gap-x-m gap-y-m flex-wrap">
      {filtersList}
    </div>
  );
};
