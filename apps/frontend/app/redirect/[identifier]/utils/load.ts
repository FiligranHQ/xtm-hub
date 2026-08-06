import serverPortalApiFetch from '@/relay/server-portal-api-fetch';
import { SettingsResponse } from '@/utils/settings.service';
import PlatformAssociatedOrganizationQueryGraphql, {
  platformAssociatedOrganizationQuery,
  platformAssociatedOrganizationQuery$data,
} from '@generated/platformAssociatedOrganizationQuery.graphql';
import ServiceInstancesListQueryGraphql, {
  serviceInstancesListQuery,
  serviceInstancesListQuery$data,
} from '@generated/serviceInstancesListQuery.graphql';
import SettingsQuery, { settingsQuery } from '@generated/settingsQuery.graphql';
import {
  OrderingMode,
  ServiceInstanceFilterKey,
  ServiceInstanceOrdering,
} from '@graphql/generated';

export const loadBaseUrlFront = async () => {
  const settingsResponse = (await serverPortalApiFetch<
    typeof SettingsQuery,
    settingsQuery
  >(SettingsQuery)) as SettingsResponse;
  return settingsResponse.data.settings.base_url_front;
};
interface PlatformAssociatedOrganizationResponse {
  data: platformAssociatedOrganizationQuery$data;
}
export const loadPlatformOrganizationId = async (
  platformId?: string | null,
  tenantId?: string | null
): Promise<string | undefined> => {
  if (!platformId) {
    return;
  }

  try {
    const associatedOrganization = (await serverPortalApiFetch<
      typeof PlatformAssociatedOrganizationQueryGraphql,
      platformAssociatedOrganizationQuery
    >(PlatformAssociatedOrganizationQueryGraphql, {
      platformId,
      tenantId,
    })) as PlatformAssociatedOrganizationResponse;

    return associatedOrganization.data.platformAssociatedOrganization?.id;
  } catch (_) {}
};

interface ServiceInstancesListResponse {
  data: serviceInstancesListQuery$data;
}

export const loadServiceInstances = async (identifier: string) => {
  const response = (await serverPortalApiFetch<
    typeof ServiceInstancesListQueryGraphql,
    serviceInstancesListQuery
  >(ServiceInstancesListQueryGraphql, {
    count: 50,
    orderBy: ServiceInstanceOrdering.Ordering,
    orderMode: OrderingMode.Asc,
    filters: [
      {
        key: ServiceInstanceFilterKey.ServiceDefinitionIdentifier,
        value: [identifier],
      },
    ],
  })) as ServiceInstancesListResponse;

  return (
    response.data.serviceInstances?.edges
      .map((edge) => edge?.node)
      .filter((node) => node != null) ?? []
  );
};
