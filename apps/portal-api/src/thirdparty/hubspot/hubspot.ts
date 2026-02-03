import config from 'config';
import {
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

export const hubspotReachOutSalesHook = async (
  message: string = 'Please contact me about the OpenCTI free trial'
) =>
  hubspotHook('reachOutSales', async () => {
    const { user, portalContext } = requestContext.require();
    const platformToken = portalContext?.req.header('XTM-Hub-Platform-Token');

    let deploymentRequest: FullyQualifiedDeploymentRequest | undefined;
    if (user?.id) {
      deploymentRequest =
        await DeploymentRequestDomain.loadTrialDeploymentRequestByPlatformIdentifierAndUserId(
          PlatformIdentifier.Opencti,
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
          message,
          use_case: '',
        };
      }
    } else if (platformToken) {
      deploymentRequest =
        await DeploymentRequestDomain.loadTrialDeploymentRequestByPlatformToken(
          platformToken
        );
      if (!deploymentRequest) {
        logApp.warn(
          `No deployment request found for platform token: ${platformToken}`
        );
        return {
          email: '',
          firstname: '',
          lastname: '',
          company: '',
          job_title: '',
          message,
          use_case: '',
        };
      }
    } else {
      throw new Error('Either userId or platformToken must be provided');
    }

    return {
      email: deploymentRequest.requester_email,
      firstname: deploymentRequest.requester_first_name,
      lastname: deploymentRequest.requester_last_name,
      company: deploymentRequest.organization_name,
      job_title: deploymentRequest.job_title,
      message: `Message sent for free trial: ${deploymentRequest.hub_status.toLowerCase()} ${deploymentRequest.platform_identifier} ${deploymentRequest.type}.\nUse Case: ${deploymentRequest.use_case}\n\n${message}`,
      use_case: deploymentRequest.use_case,
    };
  });
