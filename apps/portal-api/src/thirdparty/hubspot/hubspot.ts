import config from 'config';
import {
  DeploymentRequestDeploymentType,
  OrganizationCapability,
  PlatformIdentifier,
} from '../../__generated__/resolvers-types';
import { requestContext } from '../../context/request.context';
import { UserId } from '../../model/kanel/public/User';
import {
  DeploymentRequestDomain,
  FullyQualifiedDeploymentRequest,
} from '../../modules/services/deployments/deployments.domain';
import { loadUserBy } from '../../modules/users/users.domain';
import { logApp } from '../../utils/app-logger.util';
import { isValidUrl } from '../../utils/utils';

async function hubspotHook(
  type: string,
  buildPayload: () => Promise<Record<string, unknown>>
) {
  try {
    const webHookUrl = config.get<string>('hubspot_webhook_url');
    if (isValidUrl(webHookUrl)) {
      // 3 seconds timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const payload = await buildPayload();

      try {
        await fetch(webHookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type,
            ...payload,
          }),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }

      logApp.info(`Hubspot ${type} hook sent`);
    }
  } catch (error) {
    logApp.error(`An error occurred while sending the Hubspot ${type} hook`, {
      error,
    });
  }
}

export const hubspotLoginHook = async (userId: string) =>
  hubspotHook('login', async () => {
    const user = await loadUserBy({ 'User.id': userId as UserId });
    const is_admin = user.organization_capabilities.some((orga_capa) => {
      return (
        orga_capa.organization.personal_space === false &&
        orga_capa.capabilities.some((capa) =>
          [OrganizationCapability.AdministrateOrganization].includes(capa)
        )
      );
    });

    return {
      email: user.email,
      first_login: user.last_login === null,
      last_login: user.last_login,
      is_admin,
    };
  });

export const hubspotReachOutSalesHook = async ({
  message = 'Please contact me about the OpenCTI free trial',
  platformId,
  platformIdentifier = PlatformIdentifier.Opencti,
  platformToken,
}: {
  message?: string;
  platformIdentifier?: PlatformIdentifier;
  platformId?: string;
  platformToken?: string;
}) =>
  hubspotHook('reachOutSales', async () => {
    const { user } = requestContext.require();

    let deploymentRequest: FullyQualifiedDeploymentRequest | undefined;
    if (platformId) {
      deploymentRequest =
        await DeploymentRequestDomain.loadFullDeploymentRequestByPlatformId(
          platformId
        );

      if (!deploymentRequest) {
        throw new Error(
          `No deployment request found for platform id: ${platformId}`
        );
      }

      if (deploymentRequest.type !== DeploymentRequestDeploymentType.Trial) {
        throw new Error(
          `Deployment request ${deploymentRequest.id} is not a trial deployment request`
        );
      }

      const hasUserRightsOnRequest = user.organizations.some(
        (organization) =>
          organization.id === deploymentRequest.organization_requester_id
      );
      if (!hasUserRightsOnRequest) {
        throw new Error(
          `Deployment request ${deploymentRequest.id}, organization ${deploymentRequest.organization_requester_id} does not match user ${user.id} organizations`
        );
      }
    } else if (platformToken) {
      deploymentRequest =
        await DeploymentRequestDomain.loadTrialDeploymentRequestByPlatformToken(
          platformToken
        );
      if (!deploymentRequest) {
        throw new Error(
          `No deployment request found for platform token: ${platformToken}`
        );
      }
    } else if (user?.id) {
      deploymentRequest =
        await DeploymentRequestDomain.loadTrialDeploymentRequestByPlatformIdentifierAndUserId(
          platformIdentifier,
          user.id
        );
      if (!deploymentRequest) {
        return {
          email: user.email,
          firstname: user.first_name,
          lastname: user.last_name,
          company:
            user.organizations.find(
              (org) => org.id === user.selected_organization_id
            )?.name || '',
          job_title: '',
          message: `${platformIdentifier}: ${message}`,
          use_case: '',
        };
      }
    } else {
      throw new Error(
        'Either userId, platformToken or platformId must be provided'
      );
    }

    return {
      email: deploymentRequest.requester_email,
      firstname: deploymentRequest.requester_first_name,
      lastname: deploymentRequest.requester_last_name,
      company: deploymentRequest.organization_name,
      job_title: deploymentRequest.job_title,
      message: `${deploymentRequest.platform_identifier}: Message sent for free trial: ${deploymentRequest.hub_status.toLowerCase()} ${deploymentRequest.type}.\nUse Case: ${deploymentRequest.use_case}\n\n${message}`,
      use_case: deploymentRequest.use_case,
    };
  });
