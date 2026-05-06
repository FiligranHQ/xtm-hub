import { APP_PATH } from '@/utils/path/constant';
import { ServiceDefinitionIdentifierEnum } from '@generated/models/ServiceDefinitionIdentifier.enum';
import OrganizationSwitcherMutation, {
  OrganizationSwitcherMutation as OrganizationSwitcherMutationType,
} from '@generated/OrganizationSwitcherMutation.graphql';
import { NextRequest, NextResponse } from 'next/server';
import { serverMutateGraphQL } from '@/relay/server-portal-api-fetch';
import { isValueInEnum } from '@/utils/is-value-in-enum';
import {
  loadBaseUrlFront,
  loadMeUser,
  loadPlatformOrganizationId,
  loadServiceInstances,
} from './utils/load';
import { getLoginRedirectionURL } from './utils/url';

async function switchOrganization(organization_id: string) {
  await serverMutateGraphQL<OrganizationSwitcherMutationType>(
    OrganizationSwitcherMutation,
    {
      organization_id,
    }
  );
}
export const redirectToResource = async (
  params: { identifier: string },
  request: NextRequest
) => {
  const baseUrlFront = await loadBaseUrlFront();

  // --------------------------Handle when user is not connected--------------------------
  const user = await loadMeUser();
  if (!user) {
    return NextResponse.redirect(getLoginRedirectionURL(baseUrlFront, request)); // Then the user is connected, we pass again in this function
  }

  // Switch to correct organization
  // (used for 1Click deploy to be on the correct organization following the OpenCTI registered platform)

  // --------------------------Get organizationId--------------------------
  const searchParams = request.nextUrl.searchParams;
  // Old param kept for compatibility (old platform OpenCTI)
  const opencti_platform_id = searchParams.get('opencti_platform_id');
  // Old param kept for compatibility (OpenAEV until 2.4.0)
  const oaev_instance_id = searchParams.get('oaev_instance_id');
  // New param from now
  const platform_id = searchParams.get('platform_id');
  const tenant_id = searchParams.get('tenant_id');

  const organizationId: string | undefined = await loadPlatformOrganizationId(
    opencti_platform_id ?? oaev_instance_id ?? platform_id,
    tenant_id
  );

  // --------------------------Switch to the correct organization--------------------------
  const identifier = params.identifier;

  await switchOrganization(organizationId ?? user.selected_organization_id);

  // --------------------------Redirect to correct serviceInstance--------------------------
  if (!isValueInEnum(identifier, ServiceDefinitionIdentifierEnum)) {
    console.error(`Invalid service definition identifier: ${identifier}`);
    return new Response('Invalid identifier', { status: 400 });
  }

  const serviceInstances = await loadServiceInstances(identifier);

  if (!serviceInstances[0]) {
    return NextResponse.redirect(new URL(`/${APP_PATH}`, baseUrlFront));
  }

  return NextResponse.redirect(
    new URL(
      `/${APP_PATH}/service/${identifier}/${serviceInstances[0].id}`,
      baseUrlFront
    )
  );
};
