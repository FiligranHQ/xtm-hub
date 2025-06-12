import config from 'config';
import { Restriction } from '../../__generated__/resolvers-types';
import { UserId } from '../../model/kanel/public/User';
import { loadUserBy } from '../../modules/users/users.domain';
import { logApp } from '../../utils/app-logger.util';
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
            [
              Restriction.ManageAccess /*, Restriction.AdministrateOrganization */,
            ].includes(capa)
          )
        );
      });

      const payload = {
        email: user.email,
        first_login: user.last_login === null,
        last_login: user.last_login,
        is_admin,
      };
      console.log(payload);

      logApp.info(`Hubspot login hook sent for user ${user.email}`);
    }
  } catch (error) {
    logApp.error(error);
  }
};
