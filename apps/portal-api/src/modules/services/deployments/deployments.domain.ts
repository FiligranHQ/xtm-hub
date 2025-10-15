import { dbUnsecure } from '../../../../knexfile';
import DeploymentRequest, {
  DeploymentRequestInitializer,
  DeploymentRequestMutator,
} from '../../../model/kanel/public/DeploymentRequest';

export const insertDeploymentRequest = async (
  deploymentRequest: DeploymentRequestInitializer
) => {
  return dbUnsecure<DeploymentRequest>('DeploymentRequest')
    .insert(deploymentRequest)
    .returning('*');
};

export const loadDeploymentRequestBy = async (
  conditions: DeploymentRequestMutator
): Promise<DeploymentRequest> => {
  return dbUnsecure<DeploymentRequest>('DeploymentRequest')
    .where(conditions)
    .select('*')
    .first();
};
