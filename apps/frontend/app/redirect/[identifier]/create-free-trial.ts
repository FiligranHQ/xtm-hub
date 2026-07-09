import { serverFetchGraphQL } from '@/relay/server-portal-api-fetch';
import type { createFreeTrialAvailableTrialsQuery } from '@generated/createFreeTrialAvailableTrialsQuery.graphql';
import CreateFreeTrialAvailableTrials from '@generated/createFreeTrialAvailableTrialsQuery.graphql';
import {
  DeploymentRequestSource,
  OrganizationCapability,
  PlatformIdentifier,
  PortalCapability,
} from '@graphql/generated';
import { NextRequest, NextResponse } from 'next/server';
import { loadBaseUrlFront, loadMeUser } from './utils/load';
import { getLoginRedirectionURL } from './utils/url';

export const redirectToCreateFreeTrial = async (
  request: NextRequest,
  platformIdentifier: PlatformIdentifier = PlatformIdentifier.Opencti
) => {
  const baseUrlFront = await loadBaseUrlFront();
  const redirectionUrl = getLoginRedirectionURL(baseUrlFront, request);
  try {
    const user = await loadMeUser();
    if (!user) {
      return NextResponse.redirect(redirectionUrl);
    }
    const pathKey =
      platformIdentifier === PlatformIdentifier.Opencti ? 'opencti' : 'openaev';
    const source =
      platformIdentifier === PlatformIdentifier.Opencti
        ? DeploymentRequestSource.OpenctiDemo
        : DeploymentRequestSource.OpenaevDemo;
    const freeTrialUrl = new URL(
      `/app/service/${pathKey}-free-trial?source=${source}`,
      baseUrlFront
    );

    const isAdmin = user.capabilities.some(
      ({ name }) => name === PortalCapability.Bypass
    );
    const requiredCapabilities: OrganizationCapability[] = [
      OrganizationCapability.AdministrateOrganization,
      OrganizationCapability.ManagePlatformRegistration,
    ];
    const userIsAllowed = requiredCapabilities.some((cap) =>
      user.selected_org_capabilities.includes(cap)
    );
    if (!userIsAllowed && !isAdmin) {
      return NextResponse.redirect(freeTrialUrl);
    }

    const response =
      await serverFetchGraphQL<createFreeTrialAvailableTrialsQuery>(
        CreateFreeTrialAvailableTrials,
        {
          input: {
            organizationId: user.selected_organization_id,
            platformIdentifiers: [platformIdentifier],
          },
        }
      );
    const deployedTrials = response.data.trialDeployments.deployed;
    const availableTrials = response.data.trialDeployments.availableTrials;

    if (deployedTrials.length > 0) {
      const instanceUrl = new URL(
        `/app/service/${pathKey}_registration/${deployedTrials[0]?.serviceInstanceId}`,
        baseUrlFront
      );
      return NextResponse.redirect(instanceUrl);
    }
    if (
      availableTrials.length === 0 ||
      response.data.trialDeployments.isBlacklisted
    ) {
      return NextResponse.redirect(`${freeTrialUrl}`);
    }

    return NextResponse.redirect(`${freeTrialUrl}&openForm=true`);
  } catch (error) {
    if ((error as Error).message === 'UNAUTHENTICATED') {
      return NextResponse.redirect(redirectionUrl);
    }

    const loginURL = new URL('/login', baseUrlFront);
    return NextResponse.redirect(loginURL);
  }
};
