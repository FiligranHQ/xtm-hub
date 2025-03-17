import { getServiceInstanceUrl } from '@/lib/utils';
import serverPortalApiFetch, {
  serverMutateGraphQL,
} from '@/relay/serverPortalApiFetch';
import MeLoaderQuery, { meLoaderQuery } from '@generated/meLoaderQuery.graphql';
import OrganizationSwitcherMutation, {
  organizationSwitcherMutation,
} from '@generated/organizationSwitcherMutation.graphql';
import ServiceInstancesSubscribedByIdentifierQuery, {
  serviceInstancesSubscribedByIdentifierQuery,
  serviceInstancesSubscribedByIdentifierQuery$data,
} from '@generated/serviceInstancesSubscribedByIdentifierQuery.graphql';
import SettingsQuery, {
  settingsQuery,
  settingsQuery$data,
} from '@generated/settingsQuery.graphql';
import { NextRequest, NextResponse } from 'next/server';
import {
  fromGlobalId,
  isValidServiceDefinitionIdentifier,
  toGlobalId,
} from './helpers';

interface RedirectIdentifierGetRouteProps {
  params: Promise<{
    identifier: string;
  }>;
}

interface UserServiceOwnedResponse {
  data: serviceInstancesSubscribedByIdentifierQuery$data;
}

interface SettingsResponse {
  data: settingsQuery$data;
}

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

async function switchOrganization(organization_id: string) {
  await serverMutateGraphQL<organizationSwitcherMutation>(
    OrganizationSwitcherMutation,
    {
      organization_id,
    }
  );
}

export async function GET(
  request: NextRequest,
  { params }: RedirectIdentifierGetRouteProps
) {
  const awaitedParams = await params;
  const searchParams = request.nextUrl.searchParams;
  const identifier = awaitedParams.identifier;
  const octi_instance_id = searchParams.get('octi_instance_id');
  const service_instance_id = searchParams.get('service_instance_id');
  const custom_dashboard_id = searchParams.get('custom_dashboard_id');

  if (!isValidServiceDefinitionIdentifier(identifier)) {
    // Raise a bad request error
    return new Response('Invalid identifier', { status: 400 });
  }

  // Fetch settings to have the base URL for the frontend
  const settingsResponse = (await serverPortalApiFetch<
    typeof SettingsQuery,
    settingsQuery
  >(SettingsQuery)) as SettingsResponse;
  const baseUrlFront = settingsResponse.data.settings.base_url_front;

  // Build the login URL from the settings and the curent URL
  const getRedirectionURL = () => {
    const baseURL = new URL(baseUrlFront);
    const redirectURL = new URL(request.url);
    redirectURL.hostname = baseURL.hostname;
    redirectURL.protocol = baseURL.protocol;
    redirectURL.port = baseURL.port;
    baseURL.searchParams.set('redirect', btoa(redirectURL.toString()));
    return baseURL.toString();
  };

  try {
    // The URL to highlight the service in the homepage
    const highlightUrl = new URL(`/?h=${identifier}`, baseUrlFront);

    // 1. Load the user
    // ----------------

    const meResponse = (await serverPortalApiFetch<
      typeof MeLoaderQuery,
      meLoaderQuery
    >(MeLoaderQuery)) as MeResponse;

    const user = meResponse.data.me;

    // The user must be authenticated to access the service
    if (!user) {
      return NextResponse.redirect(getRedirectionURL());
    }

    // Find the personal space organization
    const personalSpaceGlobalId = user.organizations.find(
      (o) => o.personal_space
    )!.id;

    // 2. Load the services instances subscribed by the user's organizations
    // ----------------------------------------------------------------------

    const response = (await serverPortalApiFetch<
      typeof ServiceInstancesSubscribedByIdentifierQuery,
      serviceInstancesSubscribedByIdentifierQuery
    >(ServiceInstancesSubscribedByIdentifierQuery, {
      identifier,
    })) as UserServiceOwnedResponse;

    const servicesInstances = Array.from(
      response.data.subscribedServiceInstancesByIdentifier
    );

    // No subscribed services for any organization of the user,
    // redirect to the personal space homepage with highlighting the services
    if (servicesInstances.length === 0) {
      await switchOrganization(personalSpaceGlobalId);
      return NextResponse.redirect(highlightUrl);
    }

    // 3. Try to find the right organization to switch to
    // --------------------------------------------------

    // We check if :
    //   - there is a corresponding requested `service_instance_id` in the URL to directly redirect to the service
    //   - the the OpenCTI instance is associated with any user's organization thanks to the services links
    let organizationGlobalId: string | undefined;
    for (const instance of servicesInstances) {
      if (instance.service_instance_id === service_instance_id) {
        // We found the service instance associated with the requested service
        organizationGlobalId = toGlobalId(
          'Organization',
          instance.organization_id
        );
      } else if (instance.links) {
        for (const link of instance.links) {
          if (link && link.url === octi_instance_id) {
            // We found the organization associated with the OpenCTI instance
            organizationGlobalId = toGlobalId(
              'Organization',
              instance.organization_id
            );
            break;
          }
        }
      }
    }

    // No organization found, fallback to the personal space
    if (!organizationGlobalId) {
      organizationGlobalId = personalSpaceGlobalId;
    }

    // 4. Switch to the found organization
    await switchOrganization(organizationGlobalId);

    // 6. Redirect the user
    // --------------------

    // Get the organization service instances
    const organizationServiceInstances = servicesInstances.filter(
      (serviceInstance) =>
        serviceInstance.organization_id ===
        fromGlobalId(organizationGlobalId).id
    );

    // We have the requested service instance in the available services in the organization
    if (
      organizationServiceInstances.some(
        (serviceInstance) =>
          serviceInstance.service_instance_id === service_instance_id
      )
    ) {
      return NextResponse.redirect(
        getServiceInstanceUrl(
          baseUrlFront,
          identifier,
          toGlobalId('ServiceInstance', service_instance_id!),
          custom_dashboard_id
            ? toGlobalId('Document', custom_dashboard_id)
            : undefined
        )
      );
    }

    // If we have only one service corresponding to the request,
    // we can directly redirect to the service
    if (
      organizationServiceInstances.length === 1 &&
      organizationServiceInstances[0]
    ) {
      return NextResponse.redirect(
        getServiceInstanceUrl(
          baseUrlFront,
          identifier,
          toGlobalId(
            'ServiceInstance',
            organizationServiceInstances[0].service_instance_id
          )
        )
      );
    }

    // Otherwise, in the case where there are no or multiple services,
    // we redirect to the homepage with highlighting the services
    return NextResponse.redirect(highlightUrl);
  } catch (error) {
    const loginURL = new URL('/', baseUrlFront);

    // The user must be authenticated to access the service
    if ((error as Error).message === 'UNAUTHENTICATED') {
      return NextResponse.redirect(getRedirectionURL());
    }

    return NextResponse.redirect(loginURL);
  }
}
