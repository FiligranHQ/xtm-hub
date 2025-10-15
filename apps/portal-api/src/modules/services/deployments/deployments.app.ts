import { v4 as uuidv4 } from 'uuid';
import { dbTx } from '../../../../knexfile';
import {
  CreateDeploymentRequestInput,
  DeploymentRequest,
  DeploymentRequestStatus,
  DeploymentType,
  PlatformIdentifier,
  PlatformRegion,
} from '../../../__generated__/resolvers-types';
import { DeploymentRequestId } from '../../../model/kanel/public/DeploymentRequest';
import { requestContext } from '../../../requestContext';
import { logApp } from '../../../utils/app-logger.util';
import { ErrorCode } from '../../../utils/error/error.code';
import { serviceDefinitionDomain } from '../definition/service-definition.domain';
import { registrationDomain } from '../registration/registration.domain';
import { insertDeploymentRequest } from './deployments.domain';

export const DeploymentsApp = {
  createDeployment: async (
    input: CreateDeploymentRequestInput
  ): Promise<DeploymentRequest> => {
    const context = requestContext.require();
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

      const [createdDeploymentRequest] = await insertDeploymentRequest({
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
};
