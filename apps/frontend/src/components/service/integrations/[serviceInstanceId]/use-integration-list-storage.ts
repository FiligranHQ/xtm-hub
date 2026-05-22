'use client';

import {
  AllFilters,
  DEPLOYABLE_PARAM,
  INTEGRATION_TYPE_PARAM,
  LABEL_PARAM,
  PRODUCT_VERSION_PARAM,
  VERIFIED_PARAM,
} from '@/components/service/integrations/[serviceInstanceId]/integration-list-url-filters.utils';
import {
  ServiceListLocalStorageKey,
  useServiceListLocalStorage,
} from '@/hooks/use-service-list-local-storage';
import { useCallback, useMemo } from 'react';

export const useIntegrationListStorage = () => {
  const localStorageKey = ServiceListLocalStorageKey.OpenCTIIntegrationFeeds;
  const store = useServiceListLocalStorage(localStorageKey);

  const {
    integrationTypes,
    labels,
    deployable,
    verified,
    productVersions,
    setIntegrationTypes,
    setLabels,
    setDeployable,
    setVerified,
    setProductVersions,
  } = store;

  const filters = useMemo<AllFilters>(
    () => ({
      [INTEGRATION_TYPE_PARAM]: integrationTypes,
      [LABEL_PARAM]: labels,
      [DEPLOYABLE_PARAM]: deployable,
      [VERIFIED_PARAM]: verified,
      [PRODUCT_VERSION_PARAM]: productVersions,
    }),
    [integrationTypes, labels, deployable, verified, productVersions]
  );

  const setFilters = useCallback(
    (value: AllFilters) => {
      setIntegrationTypes(value[INTEGRATION_TYPE_PARAM] ?? {});
      setLabels(value[LABEL_PARAM] ?? {});
      setDeployable(value[DEPLOYABLE_PARAM] ?? {});
      setVerified(value[VERIFIED_PARAM] ?? {});
      setProductVersions(value[PRODUCT_VERSION_PARAM] ?? {});
    },
    [
      setIntegrationTypes,
      setLabels,
      setDeployable,
      setVerified,
      setProductVersions,
    ]
  );

  return { ...store, filters, setFilters, localStorageKey };
};
