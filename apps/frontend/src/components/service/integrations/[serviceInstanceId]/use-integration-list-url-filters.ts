'use client';

import { ServiceListFilterKey } from '@/components/service/components/header/ServiceListHeader';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ALL_FILTER_PARAMS,
  AllFilters,
  allFiltersKey,
  buildAllFiltersSearchParams,
  DEPLOYABLE_PARAM,
  FilterParamName,
  INTEGRATION_TYPE_PARAM,
  LABEL_PARAM,
  LICENSE_TYPE_PARAM,
  parseAllFiltersFromWindowSearch,
  PRODUCT_VERSION_PARAM,
  SOLUTION_CATEGORY_PARAM,
  VERIFIED_PARAM,
} from './integration-list-url-filters.utils';

const FILTER_KEY_MAP: Record<FilterParamName, ServiceListFilterKey | null> = {
  [INTEGRATION_TYPE_PARAM]: ServiceListFilterKey.IntegrationType,
  [LABEL_PARAM]: ServiceListFilterKey.Label,
  [DEPLOYABLE_PARAM]: ServiceListFilterKey.ManagerSupported,
  [VERIFIED_PARAM]: ServiceListFilterKey.Verified,
  [PRODUCT_VERSION_PARAM]: ServiceListFilterKey.ProductVersion,
  [LICENSE_TYPE_PARAM]: ServiceListFilterKey.LicenseType,
  [SOLUTION_CATEGORY_PARAM]: ServiceListFilterKey.SolutionCategory,
};

interface UseIntegrationListUrlFiltersParams {
  filters: AllFilters;
  resetAll: () => void;
  setFilters: (value: AllFilters) => void;
  setSelectedFilters: (value: ServiceListFilterKey[]) => void;
}

export const useIntegrationListUrlFilters = ({
  filters,
  resetAll,
  setFilters,
  setSelectedFilters,
}: UseIntegrationListUrlFiltersParams) => {
  const router = useRouter();
  const pathname = usePathname();

  const [filtersFromUrl] = useState<AllFilters>(
    parseAllFiltersFromWindowSearch
  );
  const lastSyncedKey = useRef<string>(allFiltersKey(filtersFromUrl));

  useLayoutEffect(() => {
    const hasAnyFilter = ALL_FILTER_PARAMS.some(
      (name) => Object.keys(filtersFromUrl[name]).length > 0
    );
    if (!hasAnyFilter) return;

    resetAll();
    setFilters(filtersFromUrl);

    const activeFilters = ALL_FILTER_PARAMS.flatMap((name) => {
      const filterKey = FILTER_KEY_MAP[name];
      return Object.keys(filtersFromUrl[name]).length > 0 && filterKey
        ? [filterKey]
        : [];
    });
    setSelectedFilters(activeFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty: runs once on mount only.

  useEffect(() => {
    const currentKey = allFiltersKey(filters);
    if (currentKey === lastSyncedKey.current) return;
    lastSyncedKey.current = currentKey;

    const params = new URLSearchParams(window.location.search);
    for (const name of ALL_FILTER_PARAMS) params.delete(name);

    new URLSearchParams(buildAllFiltersSearchParams(filters)).forEach(
      (value, key) => {
        params.set(key, value);
      }
    );

    const newSearch = params.toString();
    router.replace(`${pathname}${newSearch ? `?${newSearch}` : ''}`, {
      scroll: false,
    });
  }, [filters, pathname, router]);
};
