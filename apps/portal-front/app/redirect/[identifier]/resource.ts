import { getServiceInstanceUrl } from '@/lib/utils';
import { serverMutateGraphQL } from '@/relay/serverPortalApiFetch';
import { isValueInEnum } from '@/utils/isValueInEnum';
import { APP_PATH } from '@/utils/path/constant';
import { ServiceDefinitionIdentifierEnum } from '@generated/models/ServiceDefinitionIdentifier.enum';
import OrganizationSwitcherMutation, {
  organizationSwitcherMutation,
} from '@generated/organizationSwitcherMutation.graphql';
import { NextRequest, NextResponse } from 'next/server';
import {
  loadBaseUrlFront,
  loadMeUser,
  loadOwnedUserServices,
  loadPlatformOrganizationId,
} from './utils/load';
import { getLoginRedirectionURL } from './utils/url';

async function switchOrganization(organization_id: string) {
  await serverMutateGraphQL<organizationSwitcherMutation>(
    OrganizationSwitcherMutation,
    {
      organization_id,
    }
  );
}

// temporary fix will be fixed in the next release https://github.com/FiligranHQ/xtm-hub/issues/650
const mapNewIdentifierToOldIdentifier = (
  identifier: string
): ServiceDefinitionIdentifierEnum => {
  const mapValue: Record<string, ServiceDefinitionIdentifierEnum> = {
    octi_custom_dashboards: ServiceDefinitionIdentifierEnum.CUSTOM_DASHBOARDS,
    octi_integration_feeds: ServiceDefinitionIdentifierEnum.CSV_FEEDS,
  };
  return (
    mapValue[identifier] ?? (identifier as ServiceDefinitionIdentifierEnum)
  );
};

export const redirectToResource = async (
  params: { identifier: string },
  request: NextRequest
) => {
  const searchParams = request.nextUrl.searchParams;
  const identifier = mapNewIdentifierToOldIdentifier(params.identifier);
  const opencti_platform_id = searchParams.get('opencti_platform_id');
  const service_instance_id = searchParams.get('service_instance_id');
  const document_id = searchParams.get('document_id');

  if (!isValueInEnum(identifier, ServiceDefinitionIdentifierEnum)) {
    // Raise a bad request error
    return new Response('Invalid identifier', { status: 400 });
  }

  // Fetch settings to have the base URL for the frontend
  const baseUrlFront = await loadBaseUrlFront();

  // Build the login URL from the settings and the curent URL
  try {
    // The URL to highlight the service in the homepage
    const highlightUrl = new URL(`/${APP_PATH}?h=${identifier}`, baseUrlFront);

    // 1. Load the user
    // ----------------
    const user = await loadMeUser();
    if (!user) {
      return NextResponse.redirect(
        getLoginRedirectionURL(baseUrlFront, request)
      );
    }

    let organizationId: string | undefined =
      await loadPlatformOrganizationId(opencti_platform_id);

    // 2. Load the services instances subscribed by the user's organizations
    // ----------------------------------------------------------------------
    const servicesInstances = await loadOwnedUserServices(identifier);
    if (!organizationId) {
      organizationId = servicesInstances.find(
        (instance) => instance.service_instance_id === service_instance_id
      )?.organization_id;
    }

    const personalSpaceGlobalId = user.organizations.find(
      (o) => o.personal_space
    )!.id;

    // 3. Switch to the found organization
    await switchOrganization(organizationId ?? personalSpaceGlobalId);

    // No subscribed services for any organization of the user,
    // redirect to the personal space homepage with highlighting the services
    if (servicesInstances.length === 0) {
      return NextResponse.redirect(highlightUrl);
    }

    // 4. Redirect the user
    // --------------------

    const organizationServiceInstances = servicesInstances.filter(
      (serviceInstance) => serviceInstance.organization_id === organizationId
    );

    const isRequestedServiceAvailable = organizationServiceInstances.some(
      (serviceInstance) =>
        serviceInstance.service_instance_id === service_instance_id
    );
    if (isRequestedServiceAvailable) {
      return NextResponse.redirect(
        getServiceInstanceUrl(
          baseUrlFront,
          identifier,
          service_instance_id!,
          document_id
        )
      );
    }

    const isOnlyOneServiceAvailable =
      organizationServiceInstances.length === 1 &&
      organizationServiceInstances[0];
    if (isOnlyOneServiceAvailable) {
      return NextResponse.redirect(
        getServiceInstanceUrl(
          baseUrlFront,
          identifier,
          organizationServiceInstances[0]!.service_instance_id
        )
      );
    }

    // Otherwise, in the case where there are no or multiple services,
    // we redirect to the homepage with highlighting the services
    return NextResponse.redirect(highlightUrl);
  } catch (error) {
    const loginURL = new URL('/login', baseUrlFront);

    // The user must be authenticated to access the service
    if ((error as Error).message === 'UNAUTHENTICATED') {
      return NextResponse.redirect(
        getLoginRedirectionURL(baseUrlFront, request)
      );
    }

    return NextResponse.redirect(loginURL);
  }
};
