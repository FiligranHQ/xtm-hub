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
  SolutionCategory = 'solution_category',
  LicenseType = 'license_type',
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

  const searchInput = (
    <SearchInput
      containerClass="max-sm:w-full sm:w-[20rem]"
      placeholder={t('GenericActions.Search')}
      defaultValue={search}
      onChange={debounceHandleInput(onSearchChange)}
    />
  );

  const filterNode = (
    <ServiceListAddFilterCombobox
      filterKeys={Object.keys(filters) as ServiceListFilterKey[]}
    />
  );

  const sortControls = (
    <SortControls
      orderByOptions={sortOptions}
      onOrderByChange={(value) => setOrderBy(value as DocumentOrdering)}
      onOrderModeChange={setOrderMode}
      selectedOrderMode={orderMode}
      selectedOrderBy={orderBy}
      className="ml-2"
    />
  );

  return (
    <div className={cn('flex flex-col justify-between gap-m', className)}>
      <div className="flex flex-col gap-m sm:flex-row sm:justify-between sm:gap-s">
        <div className="flex flex-col gap-m flex-1 min-w-0 sm:flex-row sm:items-start sm:justify-between sm:gap-s">
          <div className="flex gap-s flex-wrap items-center min-w-0">
            {searchInput}
            <div className="flex gap-s items-center min-w-0">
              {filterNode}
              {sortControls}
            </div>
          </div>
          {paginationControls && (
            <div className="max-sm:w-full max-sm:[&>div]:w-full max-sm:[&>div>*:nth-child(2)]:flex-1">
              {paginationControls}
            </div>
          )}
        </div>

        {actions && (
          <div className="flex gap-s max-sm:order-first max-sm:w-full max-sm:[&>*]:flex-1 max-sm:[&>*>*]:flex-1">
            {actions}
          </div>
        )}
      </div>
      <ServiceListFilterSection filters={filters} />
    </div>
  );
};
