import { v4 as uuidv4 } from 'uuid';
import { dbTx } from '../../../../knexfile';
import {
  CreateDeploymentRequestInput,
  DeploymentAvailability,
  DeploymentRequest,
  DeploymentRequestConnection,
  DeploymentRequestFilterKey,
  DeploymentType,
  HubStatus,
  PlatformDeploymentRequest,
  PlatformIdentifier,
  PlatformRegion,
  PlatformState,
  QueryDeploymentRequestsArgs,
  ServiceInstanceCreationStatus,
  UpdateDeploymentRequestInput,
} from '../../../__generated__/resolvers-types';
import { requestContext } from '../../../context/request.context';
import {
  DeploymentRequestId,
  DeploymentRequestMutator,
} from '../../../model/kanel/public/DeploymentRequest';
import { logApp } from '../../../utils/app-logger.util';
import {
  BadRequestErrorCode,
  ErrorCode,
  NotFoundErrorCode,
} from '../../../utils/error/error.code';
import { loadOrganizationBy } from '../../organizations/organizations.domain';
import { updateSubscriptionBy } from '../../subcription/subscription.domain';
import { serviceDefinitionDomain } from '../definition/service-definition.domain';
import { registrationDomain } from '../registration/registration.domain';
import { DeploymentRequestDomain } from './deployments.domain';

import config from 'config';
import { databaseContext } from '../../../context/database.context';
import { sendMail } from '../../../server/mail-service';
import { formatName } from '../../../utils/format';
import { telemetryApp } from '../../telemetry/telemetry.app';
import {
  buildCreateDeploymentEvent,
  buildUpdateDeploymentEvent,
} from '../../telemetry/telemetry.helper';
import {
  assertFreeTrialsLimit,
  isHubStatusTransitionValid,
} from './deployments.helper';

export const DeploymentsApp = {
  createDeploymentRequest: async (
    input: CreateDeploymentRequestInput
  ): Promise<DeploymentRequest> => {
    const { user } = requestContext.require();
    const chosenOrganization = await loadOrganizationBy({
      id: user.selected_organization_id,
    });

    if (chosenOrganization.personal_space) {
      logApp.warn('You cannot request Free Trial in your personal space');
      throw new Error(ErrorCode.CantRequestFreeTrialInPersonalSpace);
    }

    if (
      input.hub_status &&
      ![HubStatus.Pending, HubStatus.Queued].includes(input.hub_status)
    ) {
      throw new Error(BadRequestErrorCode.InvalidStatus);
    }
    await assertFreeTrialsLimit(user.selected_organization_id);

    const serviceDefinition =
      await serviceDefinitionDomain.loadServiceDefinitionByPlatformIdentifier(
        input.platform_identifier
      );
    if (!serviceDefinition) {
      throw new Error(ErrorCode.ServiceDefinitionNotFound);
    }

    try {
      const hubStatus = input.hub_status ?? HubStatus.Pending;
      const ordering = Date.now();

      const createdDeploymentRequest = await databaseContext.withTransaction(
        async () => {
          const serviceInstanceId =
            await registrationDomain.registerNewPlatform({
              serviceDefinitionId: serviceDefinition.id,
              organizationId: user.selected_organization_id,
              platformIdentifier: input.platform_identifier,
              serviceInstanceCreationStatus:
                hubStatus === HubStatus.Queued
                  ? ServiceInstanceCreationStatus.Disabled
                  : ServiceInstanceCreationStatus.Pending,
            });

          return await DeploymentRequestDomain.insertDeploymentRequest({
            id: uuidv4() as DeploymentRequestId,
            user_requester_id: user.id,
            organization_requester_id: user.selected_organization_id,
            service_instance_id: serviceInstanceId,
            hub_status: hubStatus,
            target_state: null,
            actual_state: null,
            ordering,
            type: input.type,
            platform_identifier: input.platform_identifier,
            region: input.region,
            job_title: input.job_title,
            use_case: input.use_case,
            activity_sector: input.activity_sector,
            platform_token: uuidv4(),
          });
        }
      );

      try {
        const createDeploymentEvent = buildCreateDeploymentEvent(
          chosenOrganization,
          user.id,
          input.platform_identifier,
          {
            region: createdDeploymentRequest.region as PlatformRegion,
            hub_status: createdDeploymentRequest.hub_status as HubStatus,
            target_state:
              createdDeploymentRequest.target_state as PlatformState,
            actual_state:
              createdDeploymentRequest.actual_state as PlatformState,
            activity_sector: createdDeploymentRequest.activity_sector,
            job_title: createdDeploymentRequest.job_title,
            use_case: createdDeploymentRequest.use_case,
            email: user.email,
            deployment_id: createdDeploymentRequest.id,
            deployment_type: createdDeploymentRequest.type as DeploymentType,
          }
        );
        telemetryApp.sendTelemetryEvent(createDeploymentEvent);
      } catch (error) {
        logApp.error('Unable to send telemetry event', {
          error,
        });
      }

      try {
        if (createdDeploymentRequest.hub_status === HubStatus.Pending) {
          sendMail({
            to: user.email,
            template: 'opencti_free_trial_requested',
            params: {
              firstName: formatName(user.first_name ?? ''),
            },
          });
        }
      } catch (error) {
        logApp.error('Unable to send mail', {
          error,
          deploymentRequestId: createdDeploymentRequest.id,
        });
      }

      return {
        id: createdDeploymentRequest.id,
        platform_identifier:
          createdDeploymentRequest.platform_identifier as PlatformIdentifier,
        region: createdDeploymentRequest.region as PlatformRegion,
        type: createdDeploymentRequest.type as DeploymentType,
        job_title: createdDeploymentRequest.job_title,
        activity_sector: createdDeploymentRequest.activity_sector,
        use_case: createdDeploymentRequest.use_case,
        start_date: createdDeploymentRequest.start_date,
        end_date: createdDeploymentRequest.end_date,
        hub_status: createdDeploymentRequest.hub_status as HubStatus,
        target_state: createdDeploymentRequest.target_state as PlatformState,
        actual_state: createdDeploymentRequest.actual_state as PlatformState,
        ordering: createdDeploymentRequest.ordering,
        __typename: 'DeploymentRequest',
      };
    } catch (error) {
      logApp.error('unable to create deployment request', error);
    }
  },

  updateDeploymentRequest: async (
    input: UpdateDeploymentRequestInput
  ): Promise<PlatformDeploymentRequest> => {
    const deploymentRequestId = input.id as DeploymentRequestId;

    const deploymentRequest =
      await DeploymentRequestDomain.loadDeploymentRequestBy({
        id: deploymentRequestId,
      });

    if (!deploymentRequest) {
      throw new Error(NotFoundErrorCode.DeploymentRequestNotFound);
    }

    if (
      input.hub_status &&
      !isHubStatusTransitionValid(
        deploymentRequest.hub_status as HubStatus,
        input.hub_status
      )
    ) {
      throw new Error(
        BadRequestErrorCode.DeploymentRequestStatusUpdateNotAllowed
      );
    }
    const isActiveInputDataInvalid =
      input.actual_state == PlatformState.Active &&
      (!input.start_date || !input.end_date);
    if (isActiveInputDataInvalid) {
      throw new Error(BadRequestErrorCode.MissingStartOrEndDate);
    }

    const trx = await dbTx();
    requestContext.update({ trx });
    try {
      const shouldUpdateSubscriptionDates = input.start_date || input.end_date;
      if (shouldUpdateSubscriptionDates) {
        await updateSubscriptionBy(
          { service_instance_id: deploymentRequest.service_instance_id },
          {
            start_date: input.start_date,
            end_date: input.end_date,
          }
        );
      }

      const updateData: DeploymentRequestMutator = {
        start_date: input.start_date,
        end_date: input.end_date,
        product_service_instance_id: input.product_service_instance_id,
        failure_reason: input.failure_reason,
        actual_state: input.actual_state,
        ordering: input.ordering,
      };

      if (input.hub_status) {
        updateData.hub_status = input.hub_status;
        // target_state should be set explicitly if needed, not automatically computed
      }

      await DeploymentRequestDomain.updateDeploymentRequestById(
        deploymentRequestId,
        updateData
      );
    } catch (error) {
      trx.rollback();
      throw error;
    }

    try {
      const organization = await loadOrganizationBy({
        id: deploymentRequest.organization_requester_id,
      });
      const updateDeploymentEvent = buildUpdateDeploymentEvent(
        organization,
        deploymentRequest.user_requester_id,
        {
          hub_status: input.hub_status,
          actual_state: input.actual_state,
          start_date: input.start_date,
          end_date: input.end_date,
          deployment_id: deploymentRequest.id,
          deployment_type: deploymentRequest.type,
          platform_id: input.product_service_instance_id,
        }
      );

      telemetryApp.sendTelemetryEvent(updateDeploymentEvent);
    } catch (error) {
      logApp.error('Unable to send telemetry event', {
        error,
      });
    }
    trx.commit();
    return DeploymentRequestDomain.loadFullDeploymentRequestById(
      deploymentRequestId
    );
  },

  loadDeploymentRequests: async (
    args: QueryDeploymentRequestsArgs
  ): Promise<DeploymentRequestConnection> => {
    args.filters = args.filters || [];

    // By default, only return deployments with sync offset (target_state different from actual_state)
    const hasStateFilter = args.filters?.some(
      (filter) =>
        filter?.key === DeploymentRequestFilterKey.TargetState ||
        filter?.key === DeploymentRequestFilterKey.ActualState
    );

    return DeploymentRequestDomain.loadDeploymentRequests(args, {
      onlyOutOfSync: !hasStateFilter,
    });
  },
  loadAvailableDeploymentRequests: async (
    platformIdentifier: PlatformIdentifier
  ): Promise<DeploymentAvailability[]> => {
    const max_deployments =
      config.get<Record<string, number>>('max_deployments');
    const deploymentsByRegion =
      await DeploymentRequestDomain.loadDeploymentRequestCountByRegion({
        platform_identifier: platformIdentifier,
      });

    const allRegions = Object.values(PlatformRegion); // Assuming you have a Region enum

    return allRegions.map((region) => ({
      region,
      availableCount:
        (max_deployments[region] || 0) - (deploymentsByRegion[region] || 0),
    }));
  },
};
