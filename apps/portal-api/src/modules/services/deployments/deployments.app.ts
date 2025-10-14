import {
  CreateDeploymentRequestInput,
  DeploymentRequest,
  DeploymentRequestStatus,
} from '../../../__generated__/resolvers-types';
import { logApp } from '../../../utils/app-logger.util';

export const DeploymentsApp = {
  createDeployment: async (
    input: CreateDeploymentRequestInput
  ): Promise<DeploymentRequest> => {
    logApp.info('creating deployment with input:', input);
    return {
      id: '123e4567-e89b-12d3-a456-426614174000',
      status: DeploymentRequestStatus.Pending,
      platform_identifier: input.platform_identifier,
      type: input.type,
      region: input.region,
      intention: input.intention,
      job_title: input.job_title,
      activity_sector: input.activity_sector,
    };
  },
};
