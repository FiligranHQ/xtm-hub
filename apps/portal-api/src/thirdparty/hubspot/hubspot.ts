import config from 'config';
import {
  OrganizationCapability,
  PlatformIdentifier,
} from '../../__generated__/resolvers-types';
import { UserId } from '../../model/kanel/public/User';
import { DeploymentRequestDomain } from '../../modules/services/deployments/deployments.domain';
import { loadUserBy } from '../../modules/users/users.domain';
import { logApp } from '../../utils/app-logger.util';
import { isValidUrl } from '../../utils/utils';

async function hubspotHook(
  type: string,
  buildPayload: () => Promise<Record<string, unknown>>
) {
  try {
    const env = config.get<string>('environment');
    if (env !== 'production') return;
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
    logApp.error(`An error occurred while sending the Hubspot ${type} hook`);
    logApp.error(error);
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
  platformToken,
  userId,
}: {
  platformToken?: string;
  userId?: string;
}) =>
  hubspotHook('reachOutSales', async () => {
    let deploymentRequest;
    if (userId) {
      deploymentRequest =
        await DeploymentRequestDomain.loadProvisionedTrialDeploymentRequestByPlatformIdentifier(
          PlatformIdentifier.Opencti,
          userId
        );
    } else if (platformToken) {
      deploymentRequest =
        await DeploymentRequestDomain.loadProvisionedTrialDeploymentRequestByPlatformToken(
          platformToken
        );
    } else {
      throw new Error('Either userId or platformToken must be provided');
    }

    return {
      email: deploymentRequest.requester_email,
      firstname: deploymentRequest.requester_first_name,
      lastname: deploymentRequest.requester_last_name,
      company: deploymentRequest.organization_name,
      job_title: deploymentRequest.job_title,
      message: `Please contact me about my ${deploymentRequest.hub_status.toLowerCase()} ${deploymentRequest.platform_identifier} ${deploymentRequest.type}.\nUse Case: ${deploymentRequest.use_case}`,
      use_case: deploymentRequest.use_case,
    };
  });
