import serverPortalApiFetch from '@/relay/serverPortalApiFetch';
import MeLoaderQuery, { meLoaderQuery } from '@generated/meLoaderQuery.graphql';
import { ServiceDefinitionIdentifierEnum } from '@generated/models/ServiceDefinitionIdentifier.enum';
import OpenCtiPlatformAssociatedOrganizationQueryGraphql, {
  openCtiPlatformAssociatedOrganizationQuery,
  openCtiPlatformAssociatedOrganizationQuery$data,
} from '@generated/openCtiPlatformAssociatedOrganizationQuery.graphql';
import ServiceInstancesSubscribedByIdentifierQuery, {
  serviceInstancesSubscribedByIdentifierQuery,
  serviceInstancesSubscribedByIdentifierQuery$data,
} from '@generated/serviceInstancesSubscribedByIdentifierQuery.graphql';
import SettingsQuery, {
  settingsQuery,
  settingsQuery$data,
} from '@generated/settingsQuery.graphql';

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

interface SettingsResponse {
  data: settingsQuery$data;
}

export const loadBaseUrlFront = async () => {
  const settingsResponse = (await serverPortalApiFetch<
    typeof SettingsQuery,
    settingsQuery
  >(SettingsQuery)) as SettingsResponse;
  return settingsResponse.data.settings.base_url_front;
};

interface OpenCtiPlatformAssociatedOrganizationResponse {
  data: openCtiPlatformAssociatedOrganizationQuery$data;
}

export const loadPlatformOrganizationId = async (
  platformId?: string | null
): Promise<string | undefined> => {
  if (!platformId) {
    return;
  }

  try {
    const associatedOrganization = (await serverPortalApiFetch<
      typeof OpenCtiPlatformAssociatedOrganizationQueryGraphql,
      openCtiPlatformAssociatedOrganizationQuery
    >(OpenCtiPlatformAssociatedOrganizationQueryGraphql, {
      platformId,
    })) as OpenCtiPlatformAssociatedOrganizationResponse;

    return associatedOrganization.data.openCTIPlatformAssociatedOrganization.id;
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
