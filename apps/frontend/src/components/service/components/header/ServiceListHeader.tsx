import { useServiceListLocalStorageKeyContext } from '@/components/service/components/ServiceListLocalStorageKeyContext';
import { ServiceListAddFilterCombobox } from '@/components/service/components/header/filter/ServiceListAddFilterCombobox';
import { ServiceListFilterSection } from '@/components/service/components/header/filter/ServiceListFilterSection';
import { SearchInput } from '@/components/ui/SearchInput';
import { SortControls } from '@/components/ui/SortControls';
import { useServiceListLocalStorage } from '@/hooks/use-service-list-local-storage';
import { cn } from '@/lib/utils';
import { debounceHandleInput } from '@/utils/debounce';
import { DocumentOrdering } from '@graphql/generated';
import { useTranslations } from 'next-intl';
import React from 'react';

export enum ServiceListFilterKey {
  Label = 'label',
  EntityType = 'entity_type',
  IntegrationType = 'integration_type',
  ProductVersion = 'product_version',
  ManagerSupported = 'manager_supported',
  Verified = 'verified',
}

export interface ServiceListFilter {
  node: React.ReactNode;
  reset: () => void;
}

export type ServiceListFilterMap = Partial<
  Record<ServiceListFilterKey, ServiceListFilter>
>;

interface ServiceListHeaderProps {
  search: string;
  onSearchChange: (v: string) => void;
  filters: ServiceListFilterMap;
  paginationControls?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const ServiceListHeader = ({
  search,
  onSearchChange,
  filters,
  paginationControls,
  actions,
  className,
}: ServiceListHeaderProps) => {
  const t = useTranslations();
  const hasMoreThanOneFilter = Object.values(filters).length > 1;

  const { localStorageKey } = useServiceListLocalStorageKeyContext();
  const { orderBy, orderMode, setOrderBy, setOrderMode } =
    useServiceListLocalStorage(localStorageKey);

  const sortOptions = [
    DocumentOrdering.Name,
    DocumentOrdering.CreatedAt,
    DocumentOrdering.UpdatedAt,
  ].map((value) => ({
    value,
    label: t(`DocumentOrdering.${value}`),
  }));

  return (
    <div className={cn('flex flex-col justify-between gap-m', className)}>
      <div className="flex justify-between gap-s flex-wrap">
        <div className="flex gap-s flex-wrap flex-1 min-w-0">
          <SearchInput
            containerClass="w-[20rem]"
            placeholder={t('GenericActions.Search')}
            defaultValue={search}
            onChange={debounceHandleInput(onSearchChange)}
          />

          {hasMoreThanOneFilter ? (
            <ServiceListAddFilterCombobox
              filterKeys={Object.keys(filters) as ServiceListFilterKey[]}
            />
          ) : (
            <div className="max-w-full">
              {filters[ServiceListFilterKey.Label]?.node}
            </div>
          )}

          <SortControls
            orderByOptions={sortOptions}
            onOrderByChange={(value) => setOrderBy(value as DocumentOrdering)}
            onOrderModeChange={setOrderMode}
            selectedOrderMode={orderMode}
            selectedOrderBy={orderBy}
            className="ml-2"
          />
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
