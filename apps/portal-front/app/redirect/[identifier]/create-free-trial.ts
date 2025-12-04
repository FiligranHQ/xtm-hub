import { serverFetchGraphQL } from '@/relay/serverPortalApiFetch';
import type { createFreeTrialRegisteredPlatformsStatusAndTypeQuery } from '@generated/createFreeTrialRegisteredPlatformsStatusAndTypeQuery.graphql';
import CreateFreeTrialRegisteredPlatformsStatusAndTypeQuery from '@generated/createFreeTrialRegisteredPlatformsStatusAndTypeQuery.graphql';
import { DeploymentRequestDeploymentTypeEnum } from '@generated/models/DeploymentRequestDeploymentType.enum';
import { DeploymentRequestHubStatusEnum } from '@generated/models/DeploymentRequestHubStatus.enum';
import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { RestrictionEnum } from '@generated/models/Restriction.enum';
import { NextRequest, NextResponse } from 'next/server';
import { loadBaseUrlFront, loadMeUser } from './utils/load';
import { getLoginRedirectionURL } from './utils/url';

export const redirectToCreateFreeTrial = async (request: NextRequest) => {
  const baseUrlFront = await loadBaseUrlFront();
  const redirectionUrl = getLoginRedirectionURL(baseUrlFront, request);
  try {
    const user = await loadMeUser();
    if (!user) {
      return NextResponse.redirect(redirectionUrl);
    }

    const freeTrialUrl = new URL(`/app/service/free-trial`, baseUrlFront);

    const isAdmin = user.capabilities.includes(RestrictionEnum.BYPASS);
    const requiredCapabilities: OrganizationCapabilityEnum[] = [
      OrganizationCapabilityEnum.ADMINISTRATE_ORGANIZATION,
      OrganizationCapabilityEnum.MANAGE_PLATFORM_REGISTRATION,
    ];
    const userIsAllowed = requiredCapabilities.some((cap) =>
      user.selected_org_capabilities.includes(cap)
    );

    if (!userIsAllowed && !isAdmin) {
      return NextResponse.redirect(freeTrialUrl);
    }

    const response =
      await serverFetchGraphQL<createFreeTrialRegisteredPlatformsStatusAndTypeQuery>(
        CreateFreeTrialRegisteredPlatformsStatusAndTypeQuery,
        {
          input: {
            identifier: PlatformIdentifierEnum.OPENCTI,
          },
        }
      );

    const platforms = response.data.registeredPlatforms || [];
    const freeTrials = platforms.filter(
      (platform) =>
        platform.deployment_request?.type ===
        DeploymentRequestDeploymentTypeEnum.TRIAL
    );

    const isTrialStarted = [
      DeploymentRequestHubStatusEnum.QUEUED,
      DeploymentRequestHubStatusEnum.PENDING,
      DeploymentRequestHubStatusEnum.ACTIVE,
    ].includes(
      freeTrials[0]?.deployment_request
        ?.hub_status as DeploymentRequestHubStatusEnum
    );

    if (isTrialStarted) {
      const instanceUrl = new URL(
        `/app/service/opencti_registration/${freeTrials[0]?.id}`,
        baseUrlFront
      );
      return NextResponse.redirect(instanceUrl);
    }

    return NextResponse.redirect(`${freeTrialUrl}?openForm`);
  } catch (error) {
    if ((error as Error).message === 'UNAUTHENTICATED') {
      return NextResponse.redirect(redirectionUrl);
    }

    const loginURL = new URL('/login', baseUrlFront);
    return NextResponse.redirect(loginURL);
  }
};
