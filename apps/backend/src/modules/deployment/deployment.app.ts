import { toGlobalId } from 'graphql-relay/node/node.js';
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
  PlatformConfigurationStatus,
  PlatformDeploymentRequest,
  PlatformDeploymentRequestConnection,
  PlatformIdentifier,
  PortalCapability,
  QueryDeploymentRequestsArgs,
  ReorderDeploymentRequestInQueueDirection,
  ServiceDefinitionIdentifier,
  ServiceInstanceCreationStatus,
  ServiceInstanceTag,
  Success,
  TrialDeploymentsInput,
  UpdateDeploymentRequestInput,
} from '../../__generated__/resolvers-types';
import portalConfig from '../../config';
import { withTransaction } from '../../context/database.context';
import { requestContext } from '../../context/request.context';
import DeploymentRequestModel, {
  DeploymentRequestId,
  DeploymentRequestMutator,
} from '../../model/kanel/public/DeploymentRequest';
import Organization from '../../model/kanel/public/Organization';
import { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import { SubscriptionId } from '../../model/kanel/public/Subscription';
import { UserId } from '../../model/kanel/public/User';
import { UserLoadUserBy } from '../../model/user';
import {
  SYSTEM_USER_UUID,
  XTM_HUB_DEV_TEAM_EMAIL,
  XTM_HUB_SUPPORT_EMAIL,
} from '../../portal.const';
import { securityGuard } from '../../security/guard';
import { sendMail } from '../../server/mail-service';
import { auth0Client } from '../../thirdparty/auth0/client';
import { logApp } from '../../utils/app-logger.util';
import {
  BadRequestErrorCode,
  ErrorCode,
  ForbiddenErrorCode,
  NotFoundErrorCode,
} from '../../utils/error/error.code';
import { formatName } from '../../utils/format';
import { ucfirst } from '../../utils/utils';
import { OrganizationDomain } from '../organization-management/organization/organization.domain';
import { UserDomain } from '../organization-management/user/user-domain/user.domain';
import { PlatformConfigurationDomain } from '../registration/platform-configuration/platform-configuration.domain';
import { RegistrationDomain } from '../registration/registration.domain';
import {
  REGISTRABLE_PLATFORM_IDENTIFIERS,
  serviceInstanceTagMappedByPlatformIdentifier,
} from '../registration/registration.mapping';
import { ServiceDefinitionDomain } from '../service/definition/service-definition.domain';
import { ServiceInstanceDomain } from '../service/instance/service-instance.domain';
import { SubscriptionDomain } from '../subscription/subscription.domain';
import { TelemetryApp } from '../telemetry/telemetry.app';
import { TelemetryHelper } from '../telemetry/telemetry.helper';
import { CompetitorApp } from './competitor/competitor.app';
import {
  DeploymentRequestDomain,
  FullyQualifiedDeploymentRequest,
} from './deployment.domain';
import { DeploymentHelper } from './deployment.helper';
import { DeploymentQuotaDomain } from './quota/deployment.quota.domain';

export const XTM_PLATFORM_BUNDLE_SERVICE_INSTANCE_NAME = 'XTM Platform Bundle';

export const DeploymentApp = {
  createDeploymentRequest: async (
    input: CreateDeploymentRequestInput
  ): Promise<DeploymentRequest> => {
    const user = requestContext.requireUser();

    const validatedProducts = validateDeploymentRequestProducts(input);

    const chosenOrganization = await OrganizationDomain.loadOrganizationBy({
      id: user.selected_organization_id,
    });

    if (!chosenOrganization) {
      throw new Error(ErrorCode.OrganizationNotFound);
    }

    if (chosenOrganization.personal_space) {
      logApp.warn('Free trial requests are not allowed in personal spaces');
      throw new Error(ErrorCode.CantRequestFreeTrialInPersonalSpace);
    }

    if (await CompetitorApp.isOrganizationBlacklisted(chosenOrganization)) {
      logApp.warn(
        `Free trial request is blocked as at least one of organization domains ('${chosenOrganization.domains?.join(', ')}') is blacklisted`
      );
      throw new Error(ErrorCode.CantRequestFreeTrial);
    }

    try {
      if (validatedProducts.type === DeploymentRequestDeploymentType.Bundle) {
        return await createBundleDeploymentRequest({
          user,
          chosenOrganization,
          input,
          products: validatedProducts.products,
        });
      }

      const { platformIdentifier } = validatedProducts;

      await DeploymentHelper.assertFreeTrialsLimit(
        user.selected_organization_id,
        platformIdentifier
      );

      const createdDeploymentRequest = await createSingleDeploymentRequest({
        user,
        input,
        platformIdentifier,
        type: DeploymentRequestDeploymentType.Trial,
        parentId: null,
      });

      await sendDeploymentRequestCreatedNotifications({
        user,
        chosenOrganization,
        input,
        platformIdentifier,
        deploymentRequest: createdDeploymentRequest,
      });

      return DeploymentRequestDomain.loadDeploymentRequestBy({
        id: createdDeploymentRequest.id,
      }).then((result) => {
        if (!result)
          throw new Error(NotFoundErrorCode.DeploymentRequestNotFound);
        return result;
      });
    } catch (error) {
      logApp.error('unable to create deployment request', { error });
      throw error;
    }
  },

  updateDeploymentRequest: async (
    input: UpdateDeploymentRequestInput
  ): Promise<PlatformDeploymentRequest> => {
    const user = requestContext.requireUser();

    await securityGuard.assertUserPortalCapabilities(user, [
      PortalCapability.ManageDeployment,
      PortalCapability.ModifyTrials,
    ]);

    const deploymentRequestId = input.id;
    const deploymentRequest =
      await loadDeploymentRequestForUpdate(deploymentRequestId);
    await checkStatusAndDataValidity(deploymentRequest, input);
    const newStatus = resolveNextHubStatus(
      deploymentRequest,
      input.actual_state
    );

    await applyDeploymentRequestUpdateInQuotaTransaction({
      deploymentRequest,
      deploymentRequestId,
      input,
      newStatus,
    });

    const updatedDeploymentRequest =
      await DeploymentRequestDomain.loadFullDeploymentRequest({
        id: deploymentRequestId,
      });

    if (!updatedDeploymentRequest) {
      throw new Error(NotFoundErrorCode.DeploymentRequestNotFound);
    }

    await sendUpdateDeploymentTelemetryEvent(
      updatedDeploymentRequest,
      updatedDeploymentRequest.user_requester_id,
      deploymentRequest
    );

    if (
      newStatus === DeploymentRequestHubStatus.Provisioning &&
      newStatus !== deploymentRequest.hub_status
    ) {
      await sendProvisioningPlatformEmail(updatedDeploymentRequest);
    }
    if (
      newStatus === DeploymentRequestHubStatus.Active &&
      newStatus !== deploymentRequest.hub_status
    ) {
      await sendActivePlatformEmail(updatedDeploymentRequest);
    }

    return updatedDeploymentRequest;
  },

  loadPlatformDeploymentRequests: async (
    args: QueryDeploymentRequestsArgs
  ): Promise<PlatformDeploymentRequestConnection> => {
    const user = requestContext.requireUser();

    await securityGuard.assertUserPortalCapabilities(user, [
      PortalCapability.ManageDeployment,
    ]);

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
    const quotas = await DeploymentQuotaDomain.loadQuotas({
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
    const user = requestContext.requireUser();
    await DeploymentQuotaDomain.withLockedQuotaTransaction(
      { platformIdentifier, region },
      async () => {
        const { newAvailability } =
          await DeploymentQuotaDomain.updateQuotaCapacity({
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
            await DeploymentQuotaDomain.freePlace(platformIdentifier, region);
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
            await DeploymentQuotaDomain.reservePlace(
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
    const user = requestContext.requireUser();
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
      ].includes(
        deploymentRequest.actual_state ??
          DeploymentRequestPlatformState.Unprovisioned
      );

    const target_state =
      deploymentRequest.actual_state ===
      DeploymentRequestPlatformState.Unprovisioned
        ? DeploymentRequestPlatformState.Unprovisioned
        : DeploymentRequestPlatformState.Removed;

    await DeploymentQuotaDomain.withLockedQuotaTransaction(
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
          await ServiceInstanceDomain.updateServiceInstance(
            deploymentRequest.service_instance_id,
            {
              creation_status: ServiceInstanceCreationStatus.Disabled,
            }
          );
        }
        await DeploymentApp.releaseDeploymentRequestPlace(
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

    if (!updatedDeploymentRequest) {
      throw new Error(NotFoundErrorCode.DeploymentRequestNotFound);
    }

    await sendUpdateDeploymentTelemetryEvent(updatedDeploymentRequest, user.id);

    try {
      const [requester] = await UserDomain.loadUser({
        id: updatedDeploymentRequest.user_requester_id,
      });
      if (requester && updatedDeploymentRequest.platform_identifier) {
        await sendMail({
          to: requester.email,
          template: 'free_trial_cancelled',
          params: {
            firstName: formatName(requester.first_name ?? ''),
            platformIdentifier: updatedDeploymentRequest.platform_identifier,
          },
        });
      } else if (!requester) {
        logApp.warn('Requester not found for trial cancellation mail', {
          deploymentRequestId: updatedDeploymentRequest.id,
        });
      }
    } catch (error) {
      logApp.error('Unable to send mail for trial cancellation', {
        error,
        deploymentRequestId: updatedDeploymentRequest.id,
      });
    }

    try {
      if (deploymentRequest.platform_id) {
        await auth0Client.deleteAudienceAPI(
          deploymentRequest.organization_requester_id,
          deploymentRequest.platform_id
        );
      } else {
        logApp.error('Unable to delete audience', {
          error: 'missing platform_id',
          deploymentRequestId: deploymentRequest.id,
        });
      }
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
        await DeploymentQuotaDomain.withLockedQuotaTransaction(
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

            if (!updatedDeploymentRequest) {
              throw new Error(NotFoundErrorCode.DeploymentRequestNotFound);
            }

            await DeploymentApp.releaseDeploymentRequestPlace(
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
          const [requester] = await UserDomain.loadUser({
            id: trial.user_requester_id,
          });
          if (requester && trial.platform_identifier) {
            await sendMail({
              to: requester.email,
              template: 'free_trial_expired',
              params: {
                firstName: formatName(requester.first_name ?? ''),
                platformIdentifier: trial.platform_identifier,
              },
            });
          } else if (!requester) {
            logApp.warn('Requester not found for trial expiration mail', {
              trialId: trial.id,
            });
          }
        } catch (error) {
          logApp.error('Unable to send mail for trial expiration', {
            error,
            deploymentRequestId: trial.id,
          });
        }

        try {
          if (trial.platform_id) {
            await auth0Client.deleteAudienceAPI(
              trial.organization_requester_id,
              trial.platform_id
            );
          } else {
            logApp.error('Unable to delete audience', {
              error: 'missing platform_id',
              deploymentRequestId: trial.id,
            });
          }
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
    platformIdentifier: PlatformIdentifier | null,
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
      const user = requestContext.requireUser();

      await sendUpdateDeploymentTelemetryEvent(
        updatedDeploymentRequest,
        user.id
      );
      return;
    }

    await DeploymentQuotaDomain.freePlace(platformIdentifier, region);
  },
  loadTrialDeployments: async (input: TrialDeploymentsInput) => {
    const user = requestContext.requireUser();
    await securityGuard.assertUserIsInOrganization(user, input.organizationId);

    const organization = await OrganizationDomain.loadOrganizationBy({
      id: input.organizationId,
    });
    if (!organization) {
      throw new Error(ErrorCode.OrganizationNotFound);
    }
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
        input.platformIdentifiers ?? undefined
      );

    const deployedIdentifiers = new Set(
      deploymentRequests.map((d) => d.platform_identifier)
    );

    const requestedIdentifiers =
      input.platformIdentifiers ?? REGISTRABLE_PLATFORM_IDENTIFIERS;
    const availableTrials = requestedIdentifiers.filter(
      (identifier) => !deployedIdentifiers.has(identifier)
    );

    return {
      availableTrials: availableTrials,
      deployed: deploymentRequests
        .filter(
          (
            deployment
          ): deployment is DeploymentRequestModel & {
            platform_identifier: PlatformIdentifier;
          } => deployment.platform_identifier !== null
        )
        .map((deployment) => {
          return {
            serviceInstanceId: deployment.service_instance_id,
            platformIdentifier: deployment.platform_identifier,
          };
        }),
      isBlacklisted:
        await CompetitorApp.isOrganizationBlacklisted(organization),
    };
  },
};

type ValidatedDeploymentRequestProducts =
  | {
      type: DeploymentRequestDeploymentType.Bundle;
      products: PlatformIdentifier[];
    }
  | {
      type: DeploymentRequestDeploymentType.Trial;
      platformIdentifier: PlatformIdentifier;
    };

const validateDeploymentRequestProducts = (
  input: CreateDeploymentRequestInput
): ValidatedDeploymentRequestProducts => {
  const uniqueProducts = [...new Set(input.products)];
  if (input.type === DeploymentRequestDeploymentType.Bundle) {
    const includesXtmone = uniqueProducts.includes(PlatformIdentifier.Xtmone);
    const hasAtLeastOneOtherProduct = uniqueProducts.length >= 2;
    if (!includesXtmone || !hasAtLeastOneOtherProduct) {
      throw new Error(BadRequestErrorCode.InvalidProductsForDeploymentType);
    }
    return {
      type: DeploymentRequestDeploymentType.Bundle,
      products: uniqueProducts,
    };
  }

  const [platformIdentifier] = input.products;
  const hasSingleProduct = input.products.length === 1 && !!platformIdentifier;
  const isXtmone = platformIdentifier === PlatformIdentifier.Xtmone;
  if (!hasSingleProduct || isXtmone) {
    throw new Error(BadRequestErrorCode.InvalidProductsForDeploymentType);
  }
  return { type: DeploymentRequestDeploymentType.Trial, platformIdentifier };
};

const createSingleDeploymentRequest = async ({
  user,
  input,
  platformIdentifier,
  type,
  parentId,
}: {
  user: UserLoadUserBy;
  input: CreateDeploymentRequestInput;
  platformIdentifier: PlatformIdentifier;
  type: DeploymentRequestDeploymentType;
  parentId: DeploymentRequestId | null;
}): Promise<DeploymentRequestModel> => {
  const serviceDefinition =
    await ServiceDefinitionDomain.loadServiceDefinitionByPlatformIdentifier(
      platformIdentifier
    );
  if (!serviceDefinition) {
    throw new Error(ErrorCode.ServiceDefinitionNotFound);
  }

  return DeploymentQuotaDomain.withLockedQuotaTransaction(
    {
      platformIdentifier,
      region: input.region,
    },
    async () => {
      const { isPlaceAvailable } = await DeploymentQuotaDomain.reservePlace(
        platformIdentifier,
        input.region
      );
      const hubStatus = isPlaceAvailable
        ? DeploymentRequestHubStatus.Pending
        : DeploymentRequestHubStatus.Queued;
      const maxOrdering = await DeploymentRequestDomain.getMaxOrdering({
        hub_status: hubStatus,
        platform_identifier: platformIdentifier,
      });
      const ordering = (maxOrdering ?? 0) + 1;

      const serviceInstanceId = await RegistrationDomain.registerNewPlatform({
        serviceDefinitionId: serviceDefinition.id,
        organizationId: user.selected_organization_id,
        platformIdentifier,
        serviceInstanceCreationStatus: ServiceInstanceCreationStatus.Pending,
      });

      return DeploymentRequestDomain.insertDeploymentRequest({
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
        type,
        platform_identifier: platformIdentifier,
        region: input.region,
        job_title: input.job_title,
        use_case: input.use_case,
        activity_sector: input.activity_sector,
        platform_token: uuidv4(),
        source: input.source,
        parent_id: parentId,
      });
    }
  );
};

const sendDeploymentRequestCreatedNotifications = async ({
  user,
  chosenOrganization,
  input,
  platformIdentifier,
  deploymentRequest,
}: {
  user: UserLoadUserBy;
  chosenOrganization: Organization;
  input: CreateDeploymentRequestInput;
  platformIdentifier: PlatformIdentifier;
  deploymentRequest: DeploymentRequestModel;
}): Promise<void> => {
  try {
    const createDeploymentEvent = TelemetryHelper.buildCreateDeploymentEvent(
      chosenOrganization,
      user.id,
      platformIdentifier,
      input.source,
      {
        region: deploymentRequest.region,
        status: deploymentRequest.hub_status,
        activity_sector: deploymentRequest.activity_sector,
        job_title: deploymentRequest.job_title,
        use_case: deploymentRequest.use_case,
        email: user.email,
        deployment_id: deploymentRequest.id,
        deployment_type: deploymentRequest.type,
      }
    );
    await TelemetryApp.sendTelemetryEvent(createDeploymentEvent);
  } catch (error) {
    logApp.error('Unable to send telemetry event', {
      error,
    });
  }

  try {
    const mailTemplate =
      deploymentRequest.hub_status === DeploymentRequestHubStatus.Pending
        ? 'free_trial_requested'
        : 'free_trial_queued';

    await sendMail({
      to: user.email,
      template: mailTemplate,
      params: {
        firstName: formatName(user.first_name ?? ''),
        platformIdentifier,
      },
    });
  } catch (error) {
    logApp.error('Unable to send mail', {
      error,
      deploymentRequestId: deploymentRequest.id,
    });
  }

  const instanceRequestedEmail =
    portalConfig.environment === 'production'
      ? XTM_HUB_SUPPORT_EMAIL
      : XTM_HUB_DEV_TEAM_EMAIL;
  try {
    await sendMail({
      to: instanceRequestedEmail,
      template: 'admin_saas_instance_requested',
      params: {
        organizationName: chosenOrganization.name,
        userName:
          user.first_name && user.last_name
            ? `${user.first_name} ${user.last_name}`
            : `${user.email}`,
        userEmail: user.email,
        region: input.region,
        activitySector: input.activity_sector ?? undefined,
        useCase: input.use_case ?? undefined,
        platformIdentifier,
        deploymentType: ucfirst(deploymentRequest.type),
      },
    });
  } catch (error) {
    logApp.error('Unable to send mail to admins', {
      error,
      deploymentRequestId: deploymentRequest.id,
    });
  }
};

const createBundleDeploymentRequest = async ({
  user,
  chosenOrganization,
  input,
  products,
}: {
  user: UserLoadUserBy;
  chosenOrganization: Organization;
  input: CreateDeploymentRequestInput;
  products: PlatformIdentifier[];
}): Promise<DeploymentRequestModel> => {
  const bundleServiceDefinition =
    await ServiceDefinitionDomain.loadServiceDefinitionBy({
      identifier: ServiceDefinitionIdentifier.XtmPlatformBundle,
    });
  if (!bundleServiceDefinition) {
    throw new Error(ErrorCode.ServiceDefinitionNotFound);
  }

  for (const platformIdentifier of products) {
    const serviceDefinition =
      await ServiceDefinitionDomain.loadServiceDefinitionByPlatformIdentifier(
        platformIdentifier
      );
    if (!serviceDefinition) {
      throw new Error(ErrorCode.ServiceDefinitionNotFound);
    }
  }

  return withTransaction(async () => {
    const bundleServiceInstance =
      await ServiceInstanceDomain.insertServiceInstance({
        id: uuidv4() as ServiceInstanceId,
        name: XTM_PLATFORM_BUNDLE_SERVICE_INSTANCE_NAME,
        description: '',
        public: false,
        creation_status: ServiceInstanceCreationStatus.Pending,
        tags: [
          ServiceInstanceTag.Trial,
          ...products.map(
            (platformIdentifier) =>
              serviceInstanceTagMappedByPlatformIdentifier[platformIdentifier]
          ),
        ],
        service_definition_id: bundleServiceDefinition.id,
      });

    await SubscriptionDomain.createSubscription({
      id: uuidv4() as SubscriptionId,
      organization_id: user.selected_organization_id,
      service_instance_id: bundleServiceInstance.id,
      start_date: new Date(),
      end_date: null,
    });

    const maxOrdering = await DeploymentRequestDomain.getMaxOrdering({
      hub_status: DeploymentRequestHubStatus.Pending,
      platform_identifier: null,
    });

    const bundleDeploymentRequest =
      await DeploymentRequestDomain.insertDeploymentRequest({
        id: uuidv4() as DeploymentRequestId,
        user_requester_id: user.id,
        organization_requester_id: user.selected_organization_id,
        service_instance_id: bundleServiceInstance.id,
        hub_status: DeploymentRequestHubStatus.Pending,
        target_state: DeploymentRequestPlatformState.Active,
        actual_state: DeploymentRequestPlatformState.Unprovisioned,
        ordering: (maxOrdering ?? 0) + 1,
        type: DeploymentRequestDeploymentType.Bundle,
        platform_identifier: null,
        region: input.region,
        job_title: input.job_title,
        use_case: input.use_case,
        activity_sector: input.activity_sector,
        platform_token: uuidv4(),
        source: input.source,
        parent_id: null,
      });

    for (const platformIdentifier of products) {
      const childDeploymentRequest = await createSingleDeploymentRequest({
        user,
        input,
        platformIdentifier,
        type: DeploymentRequestDeploymentType.Trial,
        parentId: bundleDeploymentRequest.id,
      });

      await sendDeploymentRequestCreatedNotifications({
        user,
        chosenOrganization,
        input,
        platformIdentifier,
        deploymentRequest: childDeploymentRequest,
      });
    }

    return bundleDeploymentRequest;
  });
};

const loadDeploymentRequestForUpdate = async (
  deploymentRequestId: DeploymentRequestId
) => {
  const deploymentRequest =
    await DeploymentRequestDomain.loadDeploymentRequestBy({
      id: deploymentRequestId,
    });

  if (!deploymentRequest) {
    logApp.error(`Deployment request not found with id ${deploymentRequestId}`);
    throw new Error(NotFoundErrorCode.DeploymentRequestNotFound);
  }

  return deploymentRequest;
};

const checkStatusAndDataValidity = async (
  deploymentRequest: DeploymentRequestModel,
  input: UpdateDeploymentRequestInput
) => {
  if (
    input.actual_state &&
    !DeploymentHelper.isPlatformStateTransitionValid(
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
      `Missing start or end date for active deployment request with id ${deploymentRequest.id}`
    );
    throw new Error(BadRequestErrorCode.MissingStartOrEndDate);
  }
};

const resolveNextHubStatus = (
  deploymentRequest: DeploymentRequestModel,
  actualState: UpdateDeploymentRequestInput['actual_state']
) => {
  const computedStatus = DeploymentHelper.computeHubStatus(
    deploymentRequest.hub_status,
    actualState
  );

  // If hub status cannot be computed, keep previous status and log for investigation.
  if (!computedStatus) {
    logApp.error('Invalid deployment request hub status update', {
      deploymentRequest: deploymentRequest.id,
      new_hub_status: computedStatus,
      previous_hub_status: deploymentRequest.hub_status,
      actual_state: actualState,
    });
    return deploymentRequest.hub_status;
  }

  return computedStatus;
};

const syncPlatformRegistrationStatus = async (
  deploymentRequest: DeploymentRequestModel,
  actualState: UpdateDeploymentRequestInput['actual_state']
) => {
  if (actualState !== DeploymentRequestPlatformState.Removed) {
    return;
  }

  await PlatformConfigurationDomain.updateConfiguration(
    deploymentRequest.service_instance_id,
    { status: PlatformConfigurationStatus.Inactive }
  );
};

const applyDeploymentRequestUpdateInQuotaTransaction = async ({
  deploymentRequest,
  deploymentRequestId,
  input,
  newStatus,
}: {
  deploymentRequest: DeploymentRequestModel;
  deploymentRequestId: DeploymentRequestId;
  input: UpdateDeploymentRequestInput;
  newStatus: DeploymentRequestHubStatus;
}) => {
  await DeploymentQuotaDomain.withLockedQuotaTransaction(
    {
      platformIdentifier: deploymentRequest.platform_identifier,
      region: deploymentRequest.region,
    },
    async () => {
      const shouldUpdateSubscriptionDates = input.start_date || input.end_date;
      if (shouldUpdateSubscriptionDates) {
        await SubscriptionDomain.updateSubscriptionBy(
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
        ordering: input.ordering ?? undefined,
        hub_status: newStatus,
      };

      await DeploymentRequestDomain.updateDeploymentRequestById(
        deploymentRequestId,
        updateData
      );
      await syncPlatformRegistrationStatus(
        deploymentRequest,
        input.actual_state
      );

      if (newStatus === DeploymentRequestHubStatus.Active) {
        await DeploymentRequestDomain.initialiseServiceGroup(
          deploymentRequestId,
          deploymentRequest.platform_identifier
        );
      }
    }
  );
};

const sendProvisioningPlatformEmail = async (
  deploymentRequest: DeploymentRequestModel
) => {
  try {
    if (!deploymentRequest.platform_identifier) {
      return;
    }

    const [user] = await UserDomain.loadUser({
      id: deploymentRequest.user_requester_id,
    });
    if (user) {
      await sendMail({
        to: user.email,
        template: 'free_trial_provisioning',
        params: {
          firstName: formatName(user.first_name ?? ''),
          platformIdentifier: deploymentRequest.platform_identifier,
        },
      });
    } else {
      logApp.warn('Requester not found for provisioning platform mail', {
        deploymentRequestId: deploymentRequest.id,
      });
    }
  } catch (error) {
    logApp.error('Unable to send mail', {
      error,
      deploymentRequestId: deploymentRequest.id,
    });
  }
};

const sendActivePlatformEmail = async (
  deploymentRequest: FullyQualifiedDeploymentRequest
) => {
  try {
    if (!deploymentRequest.platform_identifier) {
      return;
    }

    if (!deploymentRequest.platform_id) {
      logApp.error('Unable to send mail after deployment request is active', {
        error: 'platform_id not set for active platform',
        deploymentRequestId: deploymentRequest.id,
      });
      return;
    }

    const platformConfiguration =
      await PlatformConfigurationDomain.loadConfigurationByPlatform(
        deploymentRequest.platform_id
      );

    if (!platformConfiguration) {
      logApp.error('Unable to send mail after deployment request is active', {
        error: NotFoundErrorCode.PlatformConfigurationNotFound,
        deploymentRequestId: deploymentRequest.id,
        platformId: deploymentRequest.platform_id,
      });
      return;
    }

    const [user] = await UserDomain.loadUser({
      id: deploymentRequest.user_requester_id,
    });

    if (!user) {
      logApp.error('Unable to send mail after deployment request is active', {
        error: 'Requester not found',
        deploymentRequestId: deploymentRequest.id,
      });
      return;
    }

    await sendMail({
      to: user.email,
      template: 'free_trial_registered',
      params: {
        firstName: formatName(user.first_name ?? ''),
        platformUrl: platformConfiguration?.platform_url,
        platformIdentifier: deploymentRequest.platform_identifier,
        globalServiceInstanceId: toGlobalId(
          'ServiceInstance',
          deploymentRequest.service_instance_id
        ),
      },
    });
  } catch (error) {
    logApp.error('Unable to send mail after deployment request is active', {
      error,
      deploymentRequestId: deploymentRequest.id,
    });
  }
};

const sendUpdateDeploymentTelemetryEvent = async (
  deploymentRequest: DeploymentRequestModel,
  userId: UserId,
  previousDeploymentRequest?: DeploymentRequestModel
) => {
  if (
    previousDeploymentRequest &&
    !DeploymentHelper.hasDeploymentTelemetryDataChanged(
      previousDeploymentRequest,
      deploymentRequest
    )
  ) {
    return;
  }

  try {
    const organization = await OrganizationDomain.loadOrganizationBy({
      id: deploymentRequest.organization_requester_id,
    });
    if (!organization) {
      throw new Error(ErrorCode.OrganizationNotFound);
    }
    const updateDeploymentEvent = TelemetryHelper.buildUpdateDeploymentEvent(
      organization,
      userId,
      {
        status: deploymentRequest.hub_status,
        start_date: deploymentRequest.start_date,
        end_date: deploymentRequest.end_date,
        deployment_id: deploymentRequest.id,
        deployment_type: deploymentRequest.type,
        platform_id: deploymentRequest.platform_id,
        cancellation_reason:
          deploymentRequest.hub_status === DeploymentRequestHubStatus.Cancelled
            ? deploymentRequest.cancellation_reason
            : undefined,
      }
    );

    await TelemetryApp.sendTelemetryEvent(updateDeploymentEvent);
  } catch (error) {
    logApp.error(
      `Unable to send telemetry event when updating deployment request with status ${deploymentRequest.hub_status}`,
      {
        error,
      }
    );
  }
};
