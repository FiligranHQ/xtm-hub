import { v4 as uuidv4 } from 'uuid';
import { OrganizationInput } from '../../../__generated__/resolvers-types';
import { requestContext } from '../../../context/request.context';
import { OrganizationId } from '../../../model/kanel/public/Organization';
import { dispatch } from '../../../pub';
import { logApp } from '../../../utils/app-logger.util';
import { ErrorCode } from '../../../utils/error/error.code';
import { telemetryApp } from '../../telemetry/telemetry.app';
import {
  buildCreateOrganizationEvent,
  buildUpdateOrganizationEvent,
} from '../../telemetry/telemetry.helper';
import { OrganizationDomain } from './organization.domain';

export const organizationApp = {
  async updateOrganization(id: OrganizationId, input: OrganizationInput) {
    const updatedOrganization = await OrganizationDomain.updateOrganizationBy(
      { id },
      { ...input }
    );

    try {
      const { user } = requestContext.require();
      const updateOrgaEvent = buildUpdateOrganizationEvent(
        updatedOrganization,
        user.id
      );
      await telemetryApp.sendTelemetryEvent(updateOrgaEvent);
    } catch (error) {
      logApp.error('Unable to send telemetry event for update organization', {
        error,
      });
    }

    return updatedOrganization;
  },

  async createOrganization(input: OrganizationInput) {
    const existingOrganization =
      await OrganizationDomain.loadOrganizationByLikeName(input.name);
    if (existingOrganization?.id) {
      throw new Error(ErrorCode.OrganizationSameNameExists);
    }

    const overlappingDomains = await OrganizationDomain.hasDomainOverlap(
      input.domains
    );
    if (overlappingDomains.length > 0) {
      throw new Error(ErrorCode.OrganizationSameDomainExists);
    }

    const createdOrganization = await OrganizationDomain.insertNewOrganization({
      id: uuidv4() as OrganizationId,
      ...input,
    });

    try {
      const { user } = requestContext.require();
      const createOrgaEvent = buildCreateOrganizationEvent(
        createdOrganization,
        user.id
      );
      await telemetryApp.sendTelemetryEvent(createOrgaEvent);
    } catch (error) {
      logApp.error('Unable to send telemetry event for create organization', {
        error,
      });
    }

    return createdOrganization;
  },

  async deleteOrganization(id: OrganizationId) {
    const deletedOrganization = await OrganizationDomain.deleteOrganizationBy({
      id,
    });

    await dispatch('Organization', 'delete', deletedOrganization);

    return deletedOrganization;
  },
};
