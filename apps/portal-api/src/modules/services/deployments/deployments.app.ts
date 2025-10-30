import { v4 as uuidv4 } from 'uuid';
import { dbTx } from '../../../../knexfile';
import {
  CreateDeploymentRequestInput,
  DeploymentRequest,
  DeploymentRequestConnection,
  DeploymentRequestFilterKey,
  DeploymentRequestStatus,
  DeploymentType,
  PlatformDeploymentRequest,
  PlatformIdentifier,
  PlatformRegion,
  QueryDeploymentRequestsArgs,
  UpdateDeploymentRequestInput,
} from '../../../__generated__/resolvers-types';
import { requestContext } from '../../../context/request.context';
import { DeploymentRequestId } from '../../../model/kanel/public/DeploymentRequest';
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
import { isTransitionValid } from './deployments.helper';

export const DeploymentsApp = {
  createDeploymentRequest: async (
    input: CreateDeploymentRequestInput
  ): Promise<DeploymentRequest> => {
    const context = requestContext.require();
    const chosenOrganization = await loadOrganizationBy({
      id: context.user.selected_organization_id,
    });

    if (chosenOrganization.personal_space) {
      logApp.warn('You cannot request Free Trial in your personal space');
      throw new Error(ErrorCode.CantRequestFreeTrialInPersonalSpace);
    }
    const serviceDefinition =
      await serviceDefinitionDomain.loadServiceDefinitionByPlatformIdentifier(
        input.platform_identifier
      );
    if (!serviceDefinition) {
      throw new Error(ErrorCode.ServiceDefinitionNotFound);
    }

    const trx = await dbTx();
    requestContext.update({ trx });
    try {
      const serviceInstanceId = await registrationDomain.registerNewPlatform({
        serviceDefinitionId: serviceDefinition.id,
        organizationId: context.user.selected_organization_id,
        platformIdentifier: input.platform_identifier,
      });

      const createdDeploymentRequest =
        await DeploymentRequestDomain.insertDeploymentRequest({
          id: uuidv4() as DeploymentRequestId,
          user_requester_id: context.user.id,
          organization_requester_id: context.user.selected_organization_id,
          service_instance_id: serviceInstanceId,
          status: DeploymentRequestStatus.Pending,
          type: input.type,
          platform_identifier: input.platform_identifier,
          region: input.region,
          job_title: input.job_title,
          use_case: input.use_case,
          activity_sector: input.activity_sector,
          platform_token: uuidv4(),
        });
      await trx.commit();
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
        status: createdDeploymentRequest.status as DeploymentRequestStatus,
        __typename: 'DeploymentRequest',
      };
    } catch (error) {
      logApp.error('unable to create deployment request', error);
      await trx.rollback();
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
      !isTransitionValid(
        deploymentRequest.status as DeploymentRequestStatus,
        input.status
      )
    ) {
      throw new Error(
        BadRequestErrorCode.DeploymentRequestStatusUpdateNotAllowed
      );
    }
    const isActiveInputDataInvalid =
      input.status == DeploymentRequestStatus.Active &&
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

      await DeploymentRequestDomain.updateDeploymentRequestById(
        deploymentRequestId,
        {
          status: input.status,
          start_date: input.start_date,
          end_date: input.end_date,
          product_service_instance_id: input.product_service_instance_id,
          failure_reason: input.failure_reason,
        }
      );
    } catch (error) {
      trx.rollback();
      throw error;
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
    const hasStatusFilter = args.filters?.some(
      (filter) => filter?.key === DeploymentRequestFilterKey.Status
    );
    if (!hasStatusFilter) {
      args.filters.push({
        key: DeploymentRequestFilterKey.Status,
        value: [DeploymentRequestStatus.Pending],
      });
    }
    return DeploymentRequestDomain.loadDeploymentRequests(args);
  },
};
