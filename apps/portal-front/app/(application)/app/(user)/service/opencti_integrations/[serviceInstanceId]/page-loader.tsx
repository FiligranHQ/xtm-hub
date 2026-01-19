'use client';

import {
  ServiceListLocalStorageKey,
  useServiceListLocalStorage,
} from '@/components/service/components/use-service-list-local-storage';
import IntegrationsList from '@/components/service/integrations/[serviceInstanceId]/integrations-list';
import { IntegrationsListQuery } from '@/components/service/integrations/integration.graphql';
import { LogicalMultiSelectSelection } from '@/components/ui/shareable-resource/logical-multi-select-form-field';
import { Skeleton } from '@filigran/ui';
import {
  integrationsQuery,
  LogicalFilterInput,
} from '@generated/integrationsQuery.graphql';
import { FilterKeyEnum } from '@generated/models/FilterKey.enum';
import { LogicalOperatorEnum } from '@generated/models/LogicalOperator.enum';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { useEffect } from 'react';
import { useQueryLoader } from 'react-relay';

interface PageLoaderProps {
  serviceInstance: serviceInstance_fragment$data;
}

const PageLoader = ({ serviceInstance }: PageLoaderProps) => {
  const [queryRef, loadQuery] = useQueryLoader<integrationsQuery>(
    IntegrationsListQuery
  );
  const {
    pageSize,
    search,
    labels,
    integrationTypes,
    productVersions,
    setSearch,
    deployable,
  } = useServiceListLocalStorage(
    ServiceListLocalStorageKey.OpenCTIIntegrationFeeds
  );

  const buildTypeSubtypeFilterExpression = (
    integrationSubtypesByTypes: LogicalMultiSelectSelection
  ): LogicalFilterInput | null | undefined => {
    const entries = Object.entries(integrationSubtypesByTypes);

    if (entries.length === 0) {
      return null;
    }

    const typeExpressions: LogicalFilterInput[] = [];
    const typesWithoutSubtypes: string[] = [];

    for (const [type, subtypes] of entries) {
      if (subtypes.length === 0) {
        typesWithoutSubtypes.push(type);
      } else {
        const typeFilter: LogicalFilterInput = {
          leaf: {
            key: FilterKeyEnum.INTEGRATION_TYPE,
            value: [type],
          },
        };
        const subtypeFilter: LogicalFilterInput = {
          leaf: {
            key: FilterKeyEnum.INTEGRATION_SUBTYPE,
            value: subtypes,
          },
        };
        const andExpression: LogicalFilterInput = {
          operator: LogicalOperatorEnum.AND,
          children: [typeFilter, subtypeFilter],
        };
        typeExpressions.push(andExpression);
      }
    }

    if (typesWithoutSubtypes.length > 0) {
      const groupedTypeFilter: LogicalFilterInput = {
        leaf: {
          key: FilterKeyEnum.INTEGRATION_TYPE,
          value: typesWithoutSubtypes,
        },
      };
      typeExpressions.push(groupedTypeFilter);
    }

    if (typeExpressions.length === 1) {
      return typeExpressions[0];
    }

    return {
      operator: LogicalOperatorEnum.OR,
      children: typeExpressions,
    };
  };

  useEffect(() => {
    const typeSubtypeFilter =
      buildTypeSubtypeFilterExpression(integrationTypes);

    loadQuery(
      {
        count: pageSize,
        orderBy: 'name',
        orderMode: 'asc',
        serviceInstanceId: serviceInstance.id,
        searchTerm: search,
        logicalFilters: {
          operator: LogicalOperatorEnum.AND,
          children: [
            {
              leaf: { key: FilterKeyEnum.LABEL, value: Object.keys(labels) },
            },
            ...(typeSubtypeFilter ? [typeSubtypeFilter] : []),
            {
              leaf: {
                key: FilterKeyEnum.PRODUCT_VERSION,
                value: Object.keys(productVersions),
              },
            },
            {
              leaf: {
                key: FilterKeyEnum.MANAGER_SUPPORTED,
                value: Object.keys(deployable),
              },
            },
          ],
        },
      },
      {
        fetchPolicy: 'store-and-network',
      }
    );
  }, [
    loadQuery,
    pageSize,
    serviceInstance,
    search,
    labels,
    integrationTypes,
    productVersions,
    deployable,
  ]);

  return (
    <>
      {queryRef ? (
        <IntegrationsList
          serviceInstance={serviceInstance}
          queryRef={queryRef}
          search={search}
          onSearchChange={setSearch}
        />
      ) : (
        <Skeleton className="w-full inset-1/2" />
      )}
    </>
  );
};

// Component export
export default PageLoader;
