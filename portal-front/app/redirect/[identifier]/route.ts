import serverPortalApiFetch, {
  serverMutateGraphQL,
} from '@/relay/serverPortalApiFetch';
import MeLoaderQuery, { meLoaderQuery } from '@generated/meLoaderQuery.graphql';
import OrganizationSwitcherMutation, {
  organizationSwitcherMutation,
} from '@generated/organizationSwitcherMutation.graphql';
import ServiceInstancesSubscribedByIdentifierQuery, {
  ServiceDefinitionIdentifier,
  serviceInstancesSubscribedByIdentifierQuery,
  serviceInstancesSubscribedByIdentifierQuery$data,
} from '@generated/serviceInstancesSubscribedByIdentifierQuery.graphql';
import { GraphQLID } from 'graphql';
import { NextRequest, NextResponse } from 'next/server';

interface RedirectIdentifierGetRouteProps {
  params: Promise<{
    /**
     The service definition identifier
    */
    identifier: string;
    /**
     * The OpenCTI instance id from where the service is accessed
     */
    octi_instance_id?: string;
  }>;
}

interface UserServiceOwnedResponse {
  data: serviceInstancesSubscribedByIdentifierQuery$data;
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

// Type guard for ServiceDefinitionIdentifier
function isValidServiceDefinitionIdentifier(
  value: unknown
): value is ServiceDefinitionIdentifier {
  return (
    typeof value === 'string' &&
    ['custom_dashboards', 'link', 'vault'].includes(value)
  );
}

// @see https://github.com/graphql/graphql-relay-js/blob/main/src/node/node.ts#L91
function toGlobalId(type: string, id: string | number): string {
  return btoa([type, GraphQLID.serialize(id)].join(':'));
}

// @see https://github.com/graphql/graphql-relay-js/blob/main/src/node/node.ts#L99
function fromGlobalId(globalId: string): { type: string; id: string } {
  const unbasedGlobalId = atob(globalId);
  const delimiterPos = unbasedGlobalId.indexOf(':');
  return {
    type: unbasedGlobalId.substring(0, delimiterPos),
    id: unbasedGlobalId.substring(delimiterPos + 1),
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
  const identifier = awaitedParams.identifier;
  const octi_instance_id = awaitedParams.octi_instance_id;

  if (!isValidServiceDefinitionIdentifier(identifier)) {
    // Raise a bad request error
    return new Response('Invalid identifier', { status: 400 });
  }

  const highlightUrl = new URL(`/?h=${identifier}`, request.url);

  try {
    // 1. Load the user
    // ----------------

    const meResponse = (await serverPortalApiFetch<
      typeof MeLoaderQuery,
      meLoaderQuery
    >(MeLoaderQuery)) as MeResponse;

    const user = meResponse.data.me;

    // The user must be authenticated to access the service
    if (!user) {
      const loginURL = new URL('/', request.url);
      loginURL.searchParams.set('redirect', btoa(request.url));
      return NextResponse.redirect(loginURL);
    }

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

    // No subscribed services, redirect to the personal space homepage
    if (servicesInstances.length === 0) {
      await switchOrganization(personalSpaceGlobalId);
      return NextResponse.redirect(highlightUrl);
    }

    // 3. From the the OpenCTI instance id, try to find the right organization to switch to
    let organizationGlobalId: string | undefined;
    for (const instance of servicesInstances) {
      if (instance.links) {
        for (const link of instance.links) {
          if (link && link.url === octi_instance_id) {
            organizationGlobalId = toGlobalId(
              'Organization',
              instance.organization_id
            );
            break;
          }
        }
      }
    }

    // No organization found, prefer the personal space
    if (!organizationGlobalId) {
      organizationGlobalId = personalSpaceGlobalId;
    }

    // 4. Switch to the organization
    await switchOrganization(organizationGlobalId);

    // 5. Get the organization service instances
    const organizationServiceInstances = servicesInstances.filter(
      (serviceInstance) =>
        serviceInstance.organization_id ===
        fromGlobalId(organizationGlobalId).id
    );

    const getServiceInstanceUrl = (service_instance_id: string) =>
      new URL(
        `/service/${identifier}/${toGlobalId('ServiceInstance', service_instance_id)}`,
        request.url
      );

    // 6. We have only one service, redirect to the service
    if (
      organizationServiceInstances.length === 1 &&
      organizationServiceInstances[0]
    ) {
      return NextResponse.redirect(
        getServiceInstanceUrl(
          organizationServiceInstances[0].service_instance_id
        )
      );
    }

    // In the case where there are multiple services, we redirect to the homepage with highlighting the services
    return NextResponse.redirect(highlightUrl);
  } catch (error) {
    const errorMessage = (error as Error).message;
    const loginURL = new URL('/', request.url);

    // The user must be authenticated to access the service
    if (errorMessage === 'UNAUTHENTICATED') {
      loginURL.searchParams.set('redirect', btoa(request.url));
      return NextResponse.redirect(loginURL);
    }

    return NextResponse.redirect(loginURL);
  }
}
