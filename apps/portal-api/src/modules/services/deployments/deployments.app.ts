import { v4 as uuidv4 } from 'uuid';
import {
  CreateDeploymentRequestInput,
  DeploymentAvailability,
  DeploymentRequest,
  DeploymentRequestDeploymentType,
  DeploymentRequestFilterKey,
  DeploymentRequestHubStatus,
  DeploymentRequestOrdering,
  DeploymentRequestPlatformRegion,
  DeploymentRequestPlatformState,
  OrderingMode,
  PlatformDeploymentRequest,
  PlatformDeploymentRequestConnection,
  PlatformIdentifier,
  QueryDeploymentRequestsArgs,
  ReorderDeploymentRequestInQueueDirection,
  ServiceInstanceCreationStatus,
  Success,
  UpdateDeploymentRequestInput,
} from '../../../__generated__/resolvers-types';
import { requestContext } from '../../../context/request.context';
import DeploymentRequestModel, {
  DeploymentRequestId,
  DeploymentRequestMutator,
} from '../../../model/kanel/public/DeploymentRequest';
import { logApp } from '../../../utils/app-logger.util';
import {
  BadRequestErrorCode,
  ErrorCode,
  ForbiddenErrorCode,
  NotFoundErrorCode,
} from '../../../utils/error/error.code';
import { loadOrganizationBy } from '../../organizations/organizations.domain';
import { updateSubscriptionBy } from '../../subcription/subscription.domain';
import { serviceDefinitionDomain } from '../definition/service-definition.domain';
import { registrationDomain } from '../registration/registration.domain';
import { DeploymentRequestDomain } from './deployments.domain';

import config from 'config';
import {
  databaseContext,
  withTransaction,
} from '../../../context/database.context';
import { SYSTEM_USER_UUID } from '../../../portal.const';
import { sendMail } from '../../../server/mail-service';
import { formatName } from '../../../utils/format';
import { telemetryApp } from '../../telemetry/telemetry.app';
import {
  buildCreateDeploymentEvent,
  buildUpdateDeploymentEvent,
} from '../../telemetry/telemetry.helper';
import { loadUnsecureUser } from '../../users/users.domain';
import { updateServiceInstance } from '../service-instance.domain';
import {
  assertFreeTrialsLimit,
  computeHubStatus,
  isPlatformStateTransitionValid,
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
      logApp.warn('Free trial requests are not allowed in personal spaces');
      throw new Error(ErrorCode.CantRequestFreeTrialInPersonalSpace);
    }

    const domainsBlacklist = (config.get<string>('domains_blacklist') ?? '')
      .split(',')
      .map((d) => d.trim());
    const organizationIsBlacklisted = chosenOrganization.domains.some(
      (domain) => domainsBlacklist.includes(domain)
    );
    if (organizationIsBlacklisted) {
      logApp.warn(
        `Free trial request is blocked as at least one of organization domains ('${chosenOrganization.domains.join(', ')}') is blacklisted`
      );
      throw new Error(ErrorCode.CantRequestFreeTrial);
    }

    if (
      input.hub_status &&
      ![
        DeploymentRequestHubStatus.Pending,
        DeploymentRequestHubStatus.Queued,
      ].includes(input.hub_status)
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
      const hubStatus = input.hub_status ?? DeploymentRequestHubStatus.Pending;

      const createdDeploymentRequest = await databaseContext.withTransaction(
        async () => {
          const maxOrdering = await DeploymentRequestDomain.getMaxOrdering();
          const ordering = (maxOrdering ?? 0) + 1;

          const serviceInstanceId =
            await registrationDomain.registerNewPlatform({
              serviceDefinitionId: serviceDefinition.id,
              organizationId: user.selected_organization_id,
              platformIdentifier: input.platform_identifier,
              serviceInstanceCreationStatus:
                ServiceInstanceCreationStatus.Pending,
            });

          return await DeploymentRequestDomain.insertDeploymentRequest({
            id: uuidv4() as DeploymentRequestId,
            user_requester_id: user.id,
            organization_requester_id: user.selected_organization_id,
            service_instance_id: serviceInstanceId,
            hub_status: hubStatus,
            target_state:
              hubStatus === DeploymentRequestHubStatus.Queued
                ? DeploymentRequestPlatformState.Unprovisioned
                : DeploymentRequestPlatformState.Active,
            actual_state: DeploymentRequestPlatformState.Unprovisioned,
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
            region:
              createdDeploymentRequest.region as DeploymentRequestPlatformRegion,
            status:
              createdDeploymentRequest.hub_status as DeploymentRequestHubStatus,
            activity_sector: createdDeploymentRequest.activity_sector,
            job_title: createdDeploymentRequest.job_title,
            use_case: createdDeploymentRequest.use_case,
            email: user.email,
            deployment_id: createdDeploymentRequest.id,
            deployment_type:
              createdDeploymentRequest.type as DeploymentRequestDeploymentType,
          }
        );
        telemetryApp.sendTelemetryEvent(createDeploymentEvent);
      } catch (error) {
        logApp.error('Unable to send telemetry event', {
          error,
        });
      }

      try {
        const mailTemplate =
          createdDeploymentRequest.hub_status ===
          DeploymentRequestHubStatus.Pending
            ? 'opencti_free_trial_requested'
            : 'opencti_free_trial_queued';

        sendMail({
          to: user.email,
          template: mailTemplate,
          params: {
            firstName: formatName(user.first_name ?? ''),
          },
        });
      } catch (error) {
        logApp.error('Unable to send mail', {
          error,
          deploymentRequestId: createdDeploymentRequest.id,
        });
      }

      return DeploymentRequestDomain.loadDeploymentRequestBy({
        id: createdDeploymentRequest.id,
      });
    } catch (error) {
      logApp.error('unable to create deployment request', error);
      throw error;
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
      logApp.error(
        `Deployment request not found with id ${deploymentRequestId}`
      );
      throw new Error(NotFoundErrorCode.DeploymentRequestNotFound);
    }

    if (
      input.actual_state &&
      !isPlatformStateTransitionValid(
        deploymentRequest.actual_state as DeploymentRequestPlatformState,
        input.actual_state
      )
    ) {
      logApp.error(
        `Invalid deployment request status update from ${deploymentRequest.actual_state} to ${input.actual_state}`
      );
      throw new Error(
        BadRequestErrorCode.DeploymentRequestStatusUpdateNotAllowed
      );
    }

    const isActiveInputDataInvalid =
      input.actual_state == DeploymentRequestPlatformState.Active &&
      (!input.start_date || !input.end_date);
    if (isActiveInputDataInvalid) {
      logApp.error(
        `Missing start or end date for active deployment request with id ${deploymentRequestId}`
      );
      throw new Error(BadRequestErrorCode.MissingStartOrEndDate);
    }

    let newStatus = computeHubStatus(
      deploymentRequest.hub_status,
      input.actual_state
    );
    // if no status is computed, it means it the transition is invalid.
    // Let's just keep the same hub_status and log an error to investigate.
    if (!newStatus) {
      logApp.error('Invalid deployment request hub status update', {
        deploymentRequest: deploymentRequest.id,
        new_hub_status: newStatus,
        previous_hub_status: deploymentRequest.hub_status,
        actual_state: input.actual_state,
      });
      newStatus = deploymentRequest.hub_status;
    }

    await withTransaction(async () => {
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
        platform_id: input.platform_id,
        failure_reason: input.failure_reason,
        actual_state: input.actual_state,
        ordering: input.ordering,
        hub_status: newStatus,
      };

      await DeploymentRequestDomain.updateDeploymentRequestById(
        deploymentRequestId,
        updateData
      );

      if (newStatus === DeploymentRequestHubStatus.Active) {
        await DeploymentRequestDomain.initialiseServiceGroup(
          input.id as DeploymentRequestId
        );
      }
    });

    try {
      const organization = await loadOrganizationBy({
        id: deploymentRequest.organization_requester_id,
      });
      const updateDeploymentEvent = buildUpdateDeploymentEvent(
        organization,
        deploymentRequest.user_requester_id,
        {
          status: newStatus,
          start_date: input.start_date,
          end_date: input.end_date,
          deployment_id: deploymentRequest.id,
          deployment_type: deploymentRequest.type,
          platform_id: input.platform_id,
        }
      );

      telemetryApp.sendTelemetryEvent(updateDeploymentEvent);
    } catch (error) {
      logApp.error('Unable to send telemetry event', {
        error,
      });
    }

    try {
      if (
        newStatus === DeploymentRequestHubStatus.Provisioning &&
        newStatus !== deploymentRequest.hub_status
      ) {
        const [user] = await loadUnsecureUser({
          id: deploymentRequest.user_requester_id,
        });

        sendMail({
          to: user.email,
          template: 'opencti_free_trial_provisioning',
          params: {
            firstName: formatName(user.first_name ?? ''),
          },
        });
      }
    } catch (error) {
      logApp.error('Unable to send mail', {
        error,
        deploymentRequestId: deploymentRequest.id,
      });
    }

    return DeploymentRequestDomain.loadFullDeploymentRequestById(
      deploymentRequestId
    );
  },

  loadPlatformDeploymentRequests: async (
    args: QueryDeploymentRequestsArgs
  ): Promise<PlatformDeploymentRequestConnection> => {
    args.filters = args.filters || [];

    // By default, only return deployments with sync offset (target_state different from actual_state)
    const hasStateFilter = args.filters?.some(
      (filter) =>
        filter?.key === DeploymentRequestFilterKey.TargetState ||
        filter?.key === DeploymentRequestFilterKey.ActualState
    );

    return DeploymentRequestDomain.loadDeploymentRequests<PlatformDeploymentRequestConnection>(
      {
        ...args,
        orderBy: DeploymentRequestOrdering.Ordering,
        orderMode: OrderingMode.Asc,
      },
      {
        onlyOutOfSync: !hasStateFilter,
      }
    );
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

    const allRegions = Object.values(DeploymentRequestPlatformRegion); // Assuming you have a Region enum

    return allRegions.map((region) => ({
      region,
      availableCount:
        (max_deployments[region] || 0) - (deploymentsByRegion[region] || 0),
    }));
  },

  reorderDeploymentRequestInQueue: async ({
    id,
    direction,
  }: {
    id: DeploymentRequestId;
    direction: ReorderDeploymentRequestInQueueDirection;
  }): Promise<Success> => {
    const deploymentRequest =
      await DeploymentRequestDomain.loadDeploymentRequestBy({ id });
    if (!deploymentRequest) {
      throw new Error(ErrorCode.DeploymentRequestNotFound);
    }

    if (DeploymentRequestHubStatus.Queued !== deploymentRequest.hub_status) {
      throw new Error(ErrorCode.DeploymentRequestHubStatusNotQueued);
    }

    switch (direction) {
      case ReorderDeploymentRequestInQueueDirection.Top:
        await DeploymentRequestDomain.reorderDeploymentRequestToTop(
          deploymentRequest
        );
        break;

      case ReorderDeploymentRequestInQueueDirection.Up:
        await DeploymentRequestDomain.reorderDeploymentRequestUp(
          deploymentRequest
        );
        break;
    }

    return {
      success: true,
    };
  },

  cancelDeploymentRequest: async (
    deploymentRequestId: DeploymentRequestId,
    isAdmin: boolean
  ): Promise<DeploymentRequest> => {
    const { user } = requestContext.require();
    const deploymentRequest =
      await DeploymentRequestDomain.loadDeploymentRequestBy({
        id: deploymentRequestId,
      });

    if (!deploymentRequest) {
      throw new Error(NotFoundErrorCode.DeploymentRequestNotFound);
    }

    if (
      !isAdmin &&
      user.selected_organization_id !==
        deploymentRequest.organization_requester_id
    ) {
      throw new Error(ForbiddenErrorCode.UserIsNotInOrganization);
    }

    const countsInOrgaQuota =
      isAdmin ||
      ![
        DeploymentRequestPlatformState.Unprovisioned,
        DeploymentRequestPlatformState.Provisioning,
      ].includes(deploymentRequest.actual_state);

    const target_state =
      deploymentRequest.actual_state ===
      DeploymentRequestPlatformState.Unprovisioned
        ? DeploymentRequestPlatformState.Unprovisioned
        : DeploymentRequestPlatformState.Removed;

    await withTransaction(async () => {
      await DeploymentRequestDomain.updateDeploymentRequestById(
        deploymentRequestId,
        {
          hub_status: DeploymentRequestHubStatus.Cancelled,
          target_state: target_state,
          cancellation_date: new Date(),
          cancellation_user_id: user.id,
          counts_in_orga_quota: countsInOrgaQuota,
        }
      );
      if (!countsInOrgaQuota) {
        await updateServiceInstance(deploymentRequest.service_instance_id, {
          creation_status: ServiceInstanceCreationStatus.Disabled,
        });
      }
    });

    const updatedDeploymentRequest =
      await DeploymentRequestDomain.loadDeploymentRequestBy({
        id: deploymentRequestId,
      });

    try {
      const organization = await loadOrganizationBy({
        id: updatedDeploymentRequest.organization_requester_id,
      });
      const updateDeploymentEvent = buildUpdateDeploymentEvent(
        organization,
        user.id,
        {
          status: updatedDeploymentRequest.hub_status,
          start_date: updatedDeploymentRequest.start_date,
          end_date: updatedDeploymentRequest.end_date,
          deployment_id: updatedDeploymentRequest.id,
          deployment_type: updatedDeploymentRequest.type,
          platform_id: updatedDeploymentRequest.platform_id,
        }
      );

      telemetryApp.sendTelemetryEvent(updateDeploymentEvent);
    } catch (error) {
      logApp.error(
        'Unable to send telemetry event when cancelling deployment request',
        {
          error,
        }
      );
    }

    try {
      const [requester] = await loadUnsecureUser({
        id: updatedDeploymentRequest.user_requester_id,
      });
      sendMail({
        to: requester.email,
        template: 'opencti_free_trial_cancelled',
        params: {
          firstName: formatName(requester.first_name ?? ''),
        },
      });
    } catch (error) {
      logApp.error('Unable to send mail for trial cancellation', {
        error,
        deploymentRequestId: updatedDeploymentRequest.id,
      });
    }

    return updatedDeploymentRequest;
  },

  expireTrials: async () => {
    const expiredTrials: DeploymentRequestModel[] =
      await DeploymentRequestDomain.loadTrialsToExpire();

    for (const trial of expiredTrials) {
      logApp.info('expiring trial', { deploymentRequestId: trial.id });

      try {
        const updatedDeploymentRequest =
          await DeploymentRequestDomain.updateDeploymentRequestById(trial.id, {
            hub_status: DeploymentRequestHubStatus.Expired,
            target_state: DeploymentRequestPlatformState.Removed,
          });

        try {
          const organization = await loadOrganizationBy({
            id: updatedDeploymentRequest.organization_requester_id,
          });
          const updateDeploymentEvent = buildUpdateDeploymentEvent(
            organization,
            SYSTEM_USER_UUID,
            {
              status:
                updatedDeploymentRequest.hub_status as DeploymentRequestHubStatus,
              start_date: updatedDeploymentRequest.start_date,
              end_date: updatedDeploymentRequest.end_date,
              deployment_id: updatedDeploymentRequest.id,
              deployment_type:
                updatedDeploymentRequest.type as DeploymentRequestDeploymentType,
              platform_id: updatedDeploymentRequest.platform_id,
            }
          );

          telemetryApp.sendTelemetryEvent(updateDeploymentEvent);
        } catch (error) {
          logApp.error('Unable to send telemetry event when expiring trials', {
            error,
          });
        }

        try {
          const [requester] = await loadUnsecureUser({
            id: trial.user_requester_id,
          });
          sendMail({
            to: requester.email,
            template: 'opencti_free_trial_expired',
            params: {
              firstName: formatName(requester.first_name ?? ''),
            },
          });
        } catch (error) {
          logApp.error('Unable to send mail for trial expiration', {
            error,
            deploymentRequestId: trial.id,
          });
        }
      } catch (error) {
        logApp.error('Error during trial expiration', {
          error,
          deploymentRequestId: trial.id,
        });
      }
    }
  },
};
