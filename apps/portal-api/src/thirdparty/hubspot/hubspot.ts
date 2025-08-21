import { logApp } from '@xtm-hub/logger';
import config from 'config';
import { OrganizationCapability } from '../../__generated__/resolvers-types';
import { UserId } from '../../model/kanel/public/User';
import { loadUserBy } from '../../modules/users/users.domain';
import { isValidUrl } from '../../utils/utils';

export const hubspotLoginHook = async (userId: string) => {
  try {
    const env = config.get<string>('environment');
    if (env !== 'production') return;
    const webHookUrl = config.get<string>('hubspot_webhook_url');
    if (isValidUrl(webHookUrl)) {
      const user = await loadUserBy({ 'User.id': userId as UserId });
      const is_admin = user.organization_capabilities.some((orga_capa) => {
        return (
          orga_capa.organization.personal_space === false &&
          orga_capa.capabilities.some((capa) =>
            [OrganizationCapability.AdministrateOrganization].includes(capa)
          )
        );
      });

      const payload = {
        email: user.email,
        first_login: user.last_login === null,
        last_login: user.last_login,
        is_admin,
      };

      // 3 seconds timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      try {
        await fetch(webHookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }

      logApp.info(`Hubspot login hook sent for user ${user.email}`);
    }
  } catch (error) {
    logApp.error('An error occurred while sending the Hubspot login hook');
    logApp.error(error);
  }
};
