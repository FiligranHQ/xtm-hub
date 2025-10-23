import { ServiceListAddFilterDropdown } from '@/components/service/components/header/filter/service-list-add-filter-dropdown';
import { ServiceListFilterSection } from '@/components/service/components/header/filter/service-list-filter-section';
import ServiceListHeaderButtons from '@/components/service/components/header/service-list-header-buttons';
import { SearchInput } from '@/components/ui/search-input';
import { debounceHandleInput } from '@/utils/debounce';
import { useTranslations } from 'next-intl';
import React from 'react';

export enum ServiceListFilterKey {
  Label = 'label',
  IntegrationFeedType = 'integration_feed_type',
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
  firstServiceSubscriptionId?: string;
  filters: ServiceListFilterMap;
}

export const ServiceListHeader: React.FC<Props> = ({
  search,
  onSearchChange,
  firstServiceSubscriptionId,
  filters,
}) => {
  const t = useTranslations();
  const hasMoreThanOneFilter = Object.values(filters).length > 1;

  return (
    <div className="flex flex-col justify-between gap-m">
      <div className="flex justify-between gap-s flex-wrap">
        <div className="flex gap-s flex-wrap">
          <SearchInput
            containerClass="w-[20rem] flex-1 max-w-[50%]"
            placeholder={t('GenericActions.Search')}
            defaultValue={search}
            onChange={debounceHandleInput(onSearchChange)}
          />

          {hasMoreThanOneFilter ? (
            <ServiceListAddFilterDropdown
              filterKeys={Object.keys(filters) as ServiceListFilterKey[]}
            />
          ) : (
            filters[ServiceListFilterKey.Label]?.node
          )}
        </div>

        <ServiceListHeaderButtons
          firstServiceSubscriptionId={firstServiceSubscriptionId ?? ''}
        />
      </div>
      {hasMoreThanOneFilter && <ServiceListFilterSection filters={filters} />}
    </div>
  );
};
