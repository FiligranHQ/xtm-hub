import { cn } from '@/lib/utils';
import { debounceHandleInput } from '@/utils/debounce';
import { DocumentOrderingEnum } from '@generated/models/DocumentOrdering.enum';
import { useTranslations } from 'next-intl';
import React from 'react';
import { useServiceListLocalStorage } from '../../../../hooks/use-service-list-local-storage';
import { SearchInput } from '../../../ui/SearchInput';
import { SortControls } from '../../../ui/SortControls';
import { useServiceListLocalStorageKeyContext } from '../ServiceListLocalStorageKeyContext';
import { ServiceListAddFilterCombobox } from './filter/ServiceListAddFilterCombobox';
import { ServiceListFilterSection } from './filter/ServiceListFilterSection';

export enum ServiceListFilterKey {
  Label = 'label',
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

  const { localStorageKey } = useServiceListLocalStorageKeyContext();
  const { orderBy, orderMode, setOrderBy, setOrderMode } =
    useServiceListLocalStorage(localStorageKey);

  const sortOptions = [
    DocumentOrderingEnum.NAME,
    DocumentOrderingEnum.CREATED_AT,
    DocumentOrderingEnum.UPDATED_AT,
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
            onOrderByChange={(value) =>
              setOrderBy(value as DocumentOrderingEnum)
            }
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
