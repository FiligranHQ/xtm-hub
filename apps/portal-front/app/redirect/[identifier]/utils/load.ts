import serverPortalApiFetch from '@/relay/serverPortalApiFetch';
import { SettingsResponse } from '@/utils/settings.service';
import MeLoaderQuery, { meLoaderQuery } from '@generated/meLoaderQuery.graphql';
import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';
import { PortalCapabilityEnum } from '@generated/models/PortalCapability.enum';
import { ServiceDefinitionIdentifierEnum } from '@generated/models/ServiceDefinitionIdentifier.enum';
import PlatformAssociatedOrganizationQueryGraphql, {
  platformAssociatedOrganizationQuery,
  platformAssociatedOrganizationQuery$data,
} from '@generated/platformAssociatedOrganizationQuery.graphql';
import ServiceInstancesSubscribedByIdentifierQuery, {
  serviceInstancesSubscribedByIdentifierQuery,
  serviceInstancesSubscribedByIdentifierQuery$data,
} from '@generated/serviceInstancesSubscribedByIdentifierQuery.graphql';
import SettingsQuery, { settingsQuery } from '@generated/settingsQuery.graphql';

interface MeResponse {
  data: {
    me: {
      id: string;
      selected_organization_id: string;
      organizations: {
        id: string;
        name: string;
        personal_space: boolean;
      }[];
      capabilities: { name: PortalCapabilityEnum }[];
      selected_org_capabilities: OrganizationCapabilityEnum[];
    };
  };
}

export const loadMeUser = async () => {
  const meResponse = (await serverPortalApiFetch<
    typeof MeLoaderQuery,
    meLoaderQuery
  >(MeLoaderQuery)) as MeResponse;
  return meResponse.data.me;
};

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
  tenantId?: string | null,
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

interface UserServiceOwnedResponse {
  data: serviceInstancesSubscribedByIdentifierQuery$data;
}

export const loadOwnedUserServices = async (
  identifier: ServiceDefinitionIdentifierEnum
) => {
  const userServiceOwnedResponse = (await serverPortalApiFetch<
    typeof ServiceInstancesSubscribedByIdentifierQuery,
    serviceInstancesSubscribedByIdentifierQuery
  >(ServiceInstancesSubscribedByIdentifierQuery, {
    identifier,
  })) as UserServiceOwnedResponse;

  return Array.from(
    userServiceOwnedResponse.data.subscribedServiceInstancesByIdentifier
  );
};
