import { ServiceListAddFilterCombobox } from '@/components/service/components/header/filter/service-list-add-filter-combobox';
import { ServiceListFilterSection } from '@/components/service/components/header/filter/service-list-filter-section';
import { SearchInput } from '@/components/ui/search-input';
import { cn } from '@/lib/utils';
import { debounceHandleInput } from '@/utils/debounce';
import { useTranslations } from 'next-intl';
import React from 'react';

export enum ServiceListFilterKey {
  Label = 'label',
  IntegrationFeedType = 'integration_feed_type',
  ProductVersion = 'product_version',
}

export interface ServiceListFilter {
  node: React.ReactNode;
  reset: () => void;
}

export type ServiceListFilterMap = Partial<
  Record<ServiceListFilterKey, ServiceListFilter>
>;

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  filters: ServiceListFilterMap;
  paginationControls?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const ServiceListHeader: React.FC<Props> = ({
  search,
  onSearchChange,
  filters,
  paginationControls,
  actions,
  className,
}) => {
  const t = useTranslations();
  const hasMoreThanOneFilter = Object.values(filters).length > 1;

  return (
    <div className={cn('flex flex-col justify-between gap-m', className)}>
      <div className="flex justify-between gap-s flex-wrap">
        <div className="flex gap-s flex-wrap">
          <SearchInput
            containerClass="w-[20rem] flex-1 max-w-[50%]"
            placeholder={t('GenericActions.Search')}
            defaultValue={search}
            onChange={debounceHandleInput(onSearchChange)}
          />

          {hasMoreThanOneFilter ? (
            <ServiceListAddFilterCombobox
              filterKeys={Object.keys(filters) as ServiceListFilterKey[]}
            />
          ) : (
            filters[ServiceListFilterKey.Label]?.node
          )}
        </div>

        <div className="flex gap-s">
          {paginationControls}
          {actions}
        </div>
      </div>
      {hasMoreThanOneFilter && <ServiceListFilterSection filters={filters} />}
    </div>
  );
};
