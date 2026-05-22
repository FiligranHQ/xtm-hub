import { ServiceListFilterMap } from '@/components/service/components/header/ServiceListHeader';
import { useServiceListFilters } from '@/hooks/use-service-list-filters';

import { AndSeparator } from '@/components/ui/shareable-resource/logical-multi-select/SelectedValuesDisplay';
import React, { useMemo } from 'react';

interface ServiceListFilterSectionProps {
  filters: ServiceListFilterMap;
}

export const ServiceListFilterSection = ({
  filters,
}: ServiceListFilterSectionProps) => {
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
    <div className="flex justify-start gap-s flex-wrap">{filtersList}</div>
  );
};
