import { ServiceListFilterMap } from '@/components/service/components/header/service-list-header';
import { useServiceListFilters } from '@/components/service/components/use-service-list-filters';

import { AndSeparator } from '@/components/ui/shareable-resource/logical-multi-select/selected-values-display';
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
            <div>{filter.node}</div>
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
