import { OrganizationInput } from '../../__generated__/resolvers-types';
import { OrganizationId } from '../../model/kanel/public/Organization';
import { PortalContext } from '../../model/portal-context';
import { logApp } from '../../utils/app-logger.util';
import { telemetryApp } from '../telemetry/telemetry.app';
import { buildUpdateOrganizationEvent } from '../telemetry/telemetry.helper';
import { updateOrganization } from './organizations.domain';

export const organizationsApp = {
  async updateOrganization(
    context: PortalContext,
    id: OrganizationId,
    input: OrganizationInput
  ) {
    const [updatedOrganization] = await updateOrganization(
      id as OrganizationId,
      { ...input }
    );
    try {
      const updateOrgaEvent = buildUpdateOrganizationEvent(
        updatedOrganization,
        context.user.id
      );
      telemetryApp.sendTelemetryEvent(updateOrgaEvent);
    } catch (error) {
      logApp.error('Unable to send telemetry event for update organization', {
        error,
      });
    }

    return updatedOrganization;
  },
};
