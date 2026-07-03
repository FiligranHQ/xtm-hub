'use client';

import { resolveDeployFirstResourceCtaTarget } from '@/components/homepage/Homepage.utils';
import { portalGraphqlClient } from '@/lib/graphql-client';
import { Button } from '@filigran/ui';
import {
  OrderingMode,
  ServiceDefinitionIdentifier,
  ServiceInstanceFilterKey,
  ServiceInstanceOrdering,
  useServiceInstancesListQuery,
  useUndeployedResourceTypesByProductQuery,
} from '@graphql/generated';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useMemo } from 'react';

const HOMEPAGE_DEPLOYABLE_SERVICE_DEFINITION_IDENTIFIERS = [
  ServiceDefinitionIdentifier.OpenctiIntegrations,
  ServiceDefinitionIdentifier.OpenctiCustomDashboards,
  ServiceDefinitionIdentifier.OpenctiPlaybooks,
  ServiceDefinitionIdentifier.OpenctiCustomViews,
  ServiceDefinitionIdentifier.OpenaevScenarios,
];

const SERVICE_INSTANCES_VARIABLES = {
  count: HOMEPAGE_DEPLOYABLE_SERVICE_DEFINITION_IDENTIFIERS.length,
  orderBy: ServiceInstanceOrdering.Name,
  orderMode: OrderingMode.Asc,
  filters: [
    {
      key: ServiceInstanceFilterKey.ServiceDefinitionIdentifier,
      value: HOMEPAGE_DEPLOYABLE_SERVICE_DEFINITION_IDENTIFIERS,
    },
  ],
  searchTerm: null,
};

const DeployFirstResourceBlock = () => {
  const t = useTranslations('HomePage.DeployFirstResource');

  const {
    data: undeployedResourceTypesByProductData,
    isError: isUndeployedResourceTypesByProductError,
    isLoading: isUndeployedResourceTypesByProductLoading,
  } = useUndeployedResourceTypesByProductQuery(portalGraphqlClient, undefined, {
    queryKey: ['UndeployedResourceTypesByProduct'],
  });

  const { data: serviceInstancesData } = useServiceInstancesListQuery(
    portalGraphqlClient,
    SERVICE_INSTANCES_VARIABLES,
    {
      queryKey: ['ServiceInstancesList', SERVICE_INSTANCES_VARIABLES],
    }
  );

  const serviceInstanceIdByDefinition = useMemo(() => {
    const serviceInstances =
      serviceInstancesData?.serviceInstances?.edges ?? [];

    return serviceInstances.reduce<
      Partial<Record<ServiceDefinitionIdentifier, string>>
    >((accumulator, edge) => {
      const serviceInstance = edge.node;
      if (!serviceInstance) {
        return accumulator;
      }

      const serviceDefinitionIdentifier =
        serviceInstance.service_definition?.identifier;

      if (!serviceDefinitionIdentifier) {
        return accumulator;
      }

      accumulator[serviceDefinitionIdentifier] = serviceInstance.id;
      return accumulator;
    }, {});
  }, [serviceInstancesData]);

  const ctaTarget = useMemo(
    () =>
      resolveDeployFirstResourceCtaTarget(
        undeployedResourceTypesByProductData?.undeployedResourceTypesByProduct ??
          [],
        serviceInstanceIdByDefinition
      ),
    [serviceInstanceIdByDefinition, undeployedResourceTypesByProductData]
  );

  if (isUndeployedResourceTypesByProductLoading) {
    return null;
  }

  if (isUndeployedResourceTypesByProductError || !ctaTarget) {
    return null;
  }

  return (
    <Button
      asChild
      variant="outline"
      className="w-full rounded border border-elevation-border-strong-layer-2 p-m mb-l text-primary">
      <Link href={ctaTarget.href}>
        {t('Title', { type: t(`Types.${ctaTarget.resourceType}`) })}
      </Link>
    </Button>
  );
};

export default DeployFirstResourceBlock;
