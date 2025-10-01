import { v4 as uuidv4 } from 'uuid';
import { db } from '../../../knexfile';
import { OrganizationInput } from '../../__generated__/resolvers-types';
import Organization, {
  OrganizationId,
} from '../../model/kanel/public/Organization';
import { PortalContext } from '../../model/portal-context';
import { logApp } from '../../utils/app-logger.util';
import { ErrorCode } from '../../utils/error/error.code';
import { telemetryApp } from '../telemetry/telemetry.app';
import {
  buildCreateOrganizationEvent,
  buildUpdateOrganizationEvent,
} from '../telemetry/telemetry.helper';
import {
  insertNewOrganization,
  updateOrganization,
} from './organizations.domain';
import { hasDomainOverlap } from './organizations.helper';

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

  async createOrganization(context: PortalContext, input: OrganizationInput) {
    const existingOrganization: Organization | undefined =
      await db<Organization>(context, 'Organization')
        .where('name', 'ILIKE', input.name)
        .first('id');
    if (existingOrganization?.id) {
      throw new Error(ErrorCode.OrganizationSameNameExists);
    }

    const overlappingDomains = await hasDomainOverlap(input.domains);
    if (overlappingDomains.length > 0) {
      throw new Error(ErrorCode.OrganizationSameDomainExists);
    }

    const [addOrganization] = await insertNewOrganization({
      id: uuidv4() as OrganizationId,
      ...input,
    });

    try {
      const createOrgaEvent = buildCreateOrganizationEvent(
        addOrganization,
        context.user.id
      );
      telemetryApp.sendTelemetryEvent(createOrgaEvent);
    } catch (error) {
      logApp.error('Unable to send telemetry event for create organization', {
        error,
      });
    }

    return addOrganization;
  },
};
