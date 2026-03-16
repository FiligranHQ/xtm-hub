import { v4 as uuidv4 } from 'uuid';
import {
  CreateDeploymentRequestInput,
  DeploymentAvailability,
  DeploymentRequest,
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
  TrialDeploymentsInput,
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
import { ServiceDefinitionDomain } from '../definition/service-definition.domain';
import { registrationDomain } from '../registration/registration.domain';
import { DeploymentRequestDomain } from './deployments.domain';

import { toGlobalId } from 'graphql-relay/node/node.js';
import portalConfig from '../../../config';
import { OrganizationId } from '../../../model/kanel/public/Organization';
import { UserId } from '../../../model/kanel/public/User';
import {
  SYSTEM_USER_UUID,
  XTM_HUB_DEV_TEAM_EMAIL,
  XTM_HUB_SUPPORT_EMAIL,
} from '../../../portal.const';
import { securityGuard } from '../../../security/guard';
import { sendMail } from '../../../server/mail-service';
import { auth0Client } from '../../../thirdparty/auth0/client';
import { formatName } from '../../../utils/format';
import { extractId, ucfirst } from '../../../utils/utils';
import { telemetryApp } from '../../telemetry/telemetry.app';
import {
  buildCreateDeploymentEvent,
  buildUpdateDeploymentEvent,
} from '../../telemetry/telemetry.helper';
import { loadUser } from '../../users/users.domain';
import { CompetitorApp } from '../competitor/competitor.app';
import { serviceContractDomain } from '../contract/service-configuration.domain';
import { updateServiceInstance } from '../service-instance.domain';
import {
  assertFreeTrialsLimit,
  computeHubStatus,
  hasDeploymentTelemetryDataChanged,
  isPlatformStateTransitionValid,
} from './deployments.helper';
import { DeploymentsQuotasDomain } from './deployments.quotas.domain';

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

    if (await CompetitorApp.isOrganizationBlacklisted(chosenOrganization)) {
      logApp.warn(
        `Free trial request is blocked as at least one of organization domains ('${chosenOrganization.domains.join(', ')}') is blacklisted`
      );
      throw new Error(ErrorCode.CantRequestFreeTrial);
    }

    await assertFreeTrialsLimit(
      user.selected_organization_id,
      input.platform_identifier
    );

    const serviceDefinition =
      await ServiceDefinitionDomain.loadServiceDefinitionByPlatformIdentifier(
        input.platform_identifier
      );
    if (!serviceDefinition) {
      throw new Error(ErrorCode.ServiceDefinitionNotFound);
    }

    try {
      const createdDeploymentRequest =
        await DeploymentsQuotasDomain.withLockedQuotaTransaction(
          {
            platformIdentifier: input.platform_identifier,
            region: input.region,
          },
          async () => {
            const { isPlaceAvailable } =
              await DeploymentsQuotasDomain.reservePlace(
                input.platform_identifier,
                input.region
              );
            const hubStatus = isPlaceAvailable
              ? DeploymentRequestHubStatus.Pending
              : DeploymentRequestHubStatus.Queued;
            const maxOrdering = await DeploymentRequestDomain.getMaxOrdering({
              hub_status: hubStatus,
              platform_identifier: input.platform_identifier,
            });
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
            region: createdDeploymentRequest.region,
            status: createdDeploymentRequest.hub_status,
            activity_sector: createdDeploymentRequest.activity_sector,
            job_title: createdDeploymentRequest.job_title,
            use_case: createdDeploymentRequest.use_case,
            email: user.email,
            deployment_id: createdDeploymentRequest.id,
            deployment_type: createdDeploymentRequest.type,
          }
        );
        await telemetryApp.sendTelemetryEvent(createDeploymentEvent);
      } catch (error) {
        logApp.error('Unable to send telemetry event', {
          error,
        });
      }

      try {
        const mailTemplate =
          createdDeploymentRequest.hub_status ===
          DeploymentRequestHubStatus.Pending
            ? 'free_trial_requested'
            : 'free_trial_queued';

        sendMail({
          to: user.email,
          template: mailTemplate,
          params: {
            firstName: formatName(user.first_name ?? ''),
            platformIdentifier: input.platform_identifier,
          },
        });
      } catch (error) {
        logApp.error('Unable to send mail', {
          error,
          deploymentRequestId: createdDeploymentRequest.id,
        });
      }

      const instanceRequestedEmail =
        portalConfig.environment === 'production'
          ? XTM_HUB_SUPPORT_EMAIL
          : XTM_HUB_DEV_TEAM_EMAIL;
      try {
        sendMail({
          to: instanceRequestedEmail,
          template: 'admin_saas_instance_requested',
          params: {
            organizationName: user.organizations.find(
              (o) => o.id === user.selected_organization_id
            ).name,
            userName:
              user.first_name && user.last_name
                ? `${user.first_name} ${user.last_name}`
                : `${user.email}`,
            userEmail: user.email,
            region: input.region,
            activitySector: input.activity_sector,
            useCase: input.use_case,
            platformIdentifier: input.platform_identifier,
            deploymentType: ucfirst(input.type),
          },
        });
      } catch (error) {
        logApp.error('Unable to send mail to admins', {
          error,
          deploymentRequestId: createdDeploymentRequest.id,
        });
      }

      return DeploymentRequestDomain.loadDeploymentRequestBy({
        id: createdDeploymentRequest.id,
      });
    } catch (error) {
      logApp.error('unable to create deployment request', { error });
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
        deploymentRequest.actual_state,
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

    await DeploymentsQuotasDomain.withLockedQuotaTransaction(
      {
        platformIdentifier: deploymentRequest.platform_identifier,
        region: deploymentRequest.region,
      },
      async () => {
        const shouldUpdateSubscriptionDates =
          input.start_date || input.end_date;
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
            deploymentRequestId,
            deploymentRequest.platform_identifier
          );
        }
      }
    );

    const updatedDeploymentRequest =
      await DeploymentRequestDomain.loadFullDeploymentRequestById(
        deploymentRequestId
      );

    await sendUpdateDeploymentTelemetryEvent(
      updatedDeploymentRequest,
      updatedDeploymentRequest.user_requester_id,
      deploymentRequest
    );

    try {
      if (
        newStatus === DeploymentRequestHubStatus.Provisioning &&
        newStatus !== deploymentRequest.hub_status
      ) {
        const [user] = await loadUser({
          id: deploymentRequest.user_requester_id,
        });

        sendMail({
          to: user.email,
          template: 'free_trial_provisioning',
          params: {
            firstName: formatName(user.first_name ?? ''),
            platformIdentifier: deploymentRequest.platform_identifier,
          },
        });
      }
    } catch (error) {
      logApp.error('Unable to send mail', {
        error,
        deploymentRequestId: deploymentRequest.id,
      });
    }

    try {
      if (
        newStatus === DeploymentRequestHubStatus.Active &&
        newStatus !== deploymentRequest.hub_status
      ) {
        const [user] = await loadUser({
          id: deploymentRequest.user_requester_id,
        });

        const serviceConfiguration =
          await serviceContractDomain.loadConfigurationByPlatform(
            deploymentRequest.platform_id
          );

        const parsedConfig = JSON.parse(
          JSON.stringify(serviceConfiguration.config)
        );

        void sendMail({
          to: user.email,
          template: 'free_trial_registered',
          params: {
            firstName: formatName(user.first_name ?? ''),
            platformUrl: parsedConfig.platform_url,
            platformIdentifier: deploymentRequest.platform_identifier,
          },
        });
      }
    } catch (error) {
      logApp.error('Unable to send mail after deployment request is active', {
        error: error,
        deploymentRequestId: deploymentRequest.id,
      });
    }

    return updatedDeploymentRequest;
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
    const quotas = await DeploymentsQuotasDomain.loadQuotas({
      platform_identifier: platformIdentifier,
    });

    return quotas.map((quota) => ({
      region: quota.region,
      availableCount: quota.availability,
      capacity: quota.capacity,
      platform_identifier: quota.platform_identifier,
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

  updateDeploymentQuotaCapacity: async ({
    platformIdentifier,
    region,
    newCapacity,
  }: {
    platformIdentifier: PlatformIdentifier;
    region: DeploymentRequestPlatformRegion;
    newCapacity: number;
  }): Promise<{ success: boolean }> => {
    const { user } = requestContext.require();
    await DeploymentsQuotasDomain.withLockedQuotaTransaction(
      { platformIdentifier, region },
      async () => {
        const { newAvailability } =
          await DeploymentsQuotasDomain.updateQuotaCapacity({
            platformIdentifier,
            region,
            newCapacity,
          });

        if (newAvailability < 0) {
          for (let i = 0; i < -newAvailability; i++) {
            const updatedRequest =
              await DeploymentRequestDomain.setLastPendingRequestAsQueued(
                platformIdentifier,
                region
              );

            if (!updatedRequest) {
              break;
            }

            void sendUpdateDeploymentTelemetryEvent(updatedRequest, user.id);
            await DeploymentsQuotasDomain.freePlace(platformIdentifier, region);
          }
        } else if (newAvailability > 0) {
          for (let i = 0; i < newAvailability; i++) {
            const updatedRequest =
              await DeploymentRequestDomain.setFirstQueuedRequestAsPending(
                platformIdentifier,
                region
              );
            if (!updatedRequest) {
              break;
            }

            void sendUpdateDeploymentTelemetryEvent(updatedRequest, user.id);
            await DeploymentsQuotasDomain.reservePlace(
              platformIdentifier,
              region
            );
          }
        }
      }
    );

    return { success: true };
  },

  cancelDeploymentRequest: async (
    deploymentRequestId: DeploymentRequestId,
    isAdmin: boolean,
    cancellationReason?: string
  ): Promise<DeploymentRequest> => {
    const { user } = requestContext.require();
    const deploymentRequest =
      await DeploymentRequestDomain.loadDeploymentRequestBy({
        id: deploymentRequestId,
      });

    if (!deploymentRequest) {
      throw new Error(NotFoundErrorCode.DeploymentRequestNotFound);
    }

    const previousHubStatus = deploymentRequest.hub_status;

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

    await DeploymentsQuotasDomain.withLockedQuotaTransaction(
      {
        platformIdentifier: deploymentRequest.platform_identifier,
        region: deploymentRequest.region,
      },
      async () => {
        await DeploymentRequestDomain.updateDeploymentRequestById(
          deploymentRequestId,
          {
            hub_status: DeploymentRequestHubStatus.Cancelled,
            target_state: target_state,
            cancellation_date: new Date(),
            cancellation_user_id: user.id,
            cancellation_reason: cancellationReason,
            counts_in_orga_quota: countsInOrgaQuota,
          }
        );
        if (!countsInOrgaQuota) {
          await updateServiceInstance(deploymentRequest.service_instance_id, {
            creation_status: ServiceInstanceCreationStatus.Disabled,
          });
        }
        await DeploymentsApp.releaseDeploymentRequestPlace(
          previousHubStatus,
          deploymentRequest.platform_identifier,
          deploymentRequest.region
        );
      }
    );

    const updatedDeploymentRequest =
      await DeploymentRequestDomain.loadDeploymentRequestBy({
        id: deploymentRequestId,
      });

    await sendUpdateDeploymentTelemetryEvent(updatedDeploymentRequest, user.id);

    try {
      const [requester] = await loadUser({
        id: updatedDeploymentRequest.user_requester_id,
      });
      sendMail({
        to: requester.email,
        template: 'free_trial_cancelled',
        params: {
          firstName: formatName(requester.first_name ?? ''),
          platformIdentifier: updatedDeploymentRequest.platform_identifier,
        },
      });
    } catch (error) {
      logApp.error('Unable to send mail for trial cancellation', {
        error,
        deploymentRequestId: updatedDeploymentRequest.id,
      });
    }

    try {
      await auth0Client.deleteAudienceAPI(
        deploymentRequest.organization_requester_id,
        deploymentRequest.platform_id
      );
    } catch (error) {
      logApp.error('Unable to delete audience', {
        error,
        deploymentRequestId: deploymentRequest.id,
      });
    }

    return updatedDeploymentRequest;
  },

  expireTrials: async () => {
    const expiredTrials: DeploymentRequestModel[] =
      await DeploymentRequestDomain.loadTrialsToExpire();

    for (const trial of expiredTrials) {
      const previousHubStatus = trial.hub_status;
      logApp.info('expiring trial', { deploymentRequestId: trial.id });

      try {
        await DeploymentsQuotasDomain.withLockedQuotaTransaction(
          {
            platformIdentifier: trial.platform_identifier,
            region: trial.region,
          },
          async () => {
            const updatedDeploymentRequest =
              await DeploymentRequestDomain.updateDeploymentRequestById(
                trial.id,
                {
                  hub_status: DeploymentRequestHubStatus.Expired,
                  target_state: DeploymentRequestPlatformState.Removed,
                }
              );

            await DeploymentsApp.releaseDeploymentRequestPlace(
              previousHubStatus,
              trial.platform_identifier,
              trial.region
            );

            await sendUpdateDeploymentTelemetryEvent(
              updatedDeploymentRequest,
              SYSTEM_USER_UUID
            );
          }
        );

        try {
          const [requester] = await loadUser({
            id: trial.user_requester_id,
          });
          sendMail({
            to: requester.email,
            template: 'free_trial_expired',
            params: {
              firstName: formatName(requester.first_name ?? ''),
              platformIdentifier: trial.platform_identifier,
            },
          });
        } catch (error) {
          logApp.error('Unable to send mail for trial expiration', {
            error,
            deploymentRequestId: trial.id,
          });
        }

        try {
          await auth0Client.deleteAudienceAPI(
            trial.organization_requester_id,
            trial.platform_id
          );
        } catch (error) {
          logApp.error('Unable to delete audience', {
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

  releaseDeploymentRequestPlace: async (
    previousHubStatus: DeploymentRequestHubStatus,
    platformIdentifier: PlatformIdentifier,
    region: DeploymentRequestPlatformRegion
  ) => {
    const isRequestCountedInQuotas = [
      DeploymentRequestHubStatus.Active,
      DeploymentRequestHubStatus.Pending,
      DeploymentRequestHubStatus.Provisioning,
    ].includes(previousHubStatus);
    if (!isRequestCountedInQuotas) {
      return;
    }

    const updatedDeploymentRequest =
      await DeploymentRequestDomain.setFirstQueuedRequestAsPending(
        platformIdentifier,
        region
      );
    if (updatedDeploymentRequest) {
      const { user } = requestContext.require();

      await sendUpdateDeploymentTelemetryEvent(
        updatedDeploymentRequest,
        user.id
      );
      return;
    }

    await DeploymentsQuotasDomain.freePlace(platformIdentifier, region);
  },
  loadTrialDeployments: async (input: TrialDeploymentsInput) => {
    const { user } = requestContext.require();
    const organizationId = extractId<OrganizationId>(input.organizationId);

    await securityGuard.assertUserIsInOrganization(user, organizationId);

    const organization = await loadOrganizationBy({
      id: organizationId,
    });
    if (organization.personal_space) {
      return {
        availableTrials: [],
        deployed: [],
        isBlacklisted: false,
      };
    }

    const deploymentRequests =
      await DeploymentRequestDomain.loadTrialsForOrganization(
        user.selected_organization_id,
        input.platformIdentifiers
      );

    const deployedIdentifiers = new Set(
      deploymentRequests.map((d) => d.platform_identifier)
    );

    const requestedIdentifiers =
      input.platformIdentifiers ?? Object.values(PlatformIdentifier);
    const availableTrials = requestedIdentifiers.filter(
      (identifier) => !deployedIdentifiers.has(identifier)
    );

    return {
      availableTrials: availableTrials,
      deployed: deploymentRequests.map((deployment) => {
        return {
          serviceInstanceId: toGlobalId(
            'ServiceInstance',
            deployment.service_instance_id
          ),
          platformIdentifier: deployment.platform_identifier,
        };
      }),
      isBlacklisted:
        await CompetitorApp.isOrganizationBlacklisted(organization),
    };
  },
};

const sendUpdateDeploymentTelemetryEvent = async (
  deploymentRequest: DeploymentRequestModel,
  userId: UserId,
  previousDeploymentRequest?: DeploymentRequestModel
) => {
  if (
    previousDeploymentRequest &&
    !hasDeploymentTelemetryDataChanged(
      previousDeploymentRequest,
      deploymentRequest
    )
  ) {
    return;
  }

  try {
    const organization = await loadOrganizationBy({
      id: deploymentRequest.organization_requester_id,
    });
    const updateDeploymentEvent = buildUpdateDeploymentEvent(
      organization,
      userId,
      {
        status: deploymentRequest.hub_status,
        start_date: deploymentRequest.start_date,
        end_date: deploymentRequest.end_date,
        deployment_id: deploymentRequest.id,
        deployment_type: deploymentRequest.type,
        platform_id: deploymentRequest.platform_id,
        ...(deploymentRequest.hub_status ===
          DeploymentRequestHubStatus.Cancelled && {
          cancellation_reason: deploymentRequest.cancellation_reason,
        }),
      }
    );

    await telemetryApp.sendTelemetryEvent(updateDeploymentEvent);
  } catch (error) {
    logApp.error(
      `Unable to send telemetry event when updating deployment request with status ${deploymentRequest.hub_status}`,
      {
        error,
      }
    );
  }
};
