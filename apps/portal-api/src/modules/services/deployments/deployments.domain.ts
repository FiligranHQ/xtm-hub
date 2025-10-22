import { dbUnsecure, paginate } from '../../../../knexfile';
import {
  DeploymentRequestConnection,
  QueryDeploymentRequestsArgs,
} from '../../../__generated__/resolvers-types';
import DeploymentRequest, {
  DeploymentRequestInitializer,
  DeploymentRequestMutator,
} from '../../../model/kanel/public/DeploymentRequest';

export const DeploymentRequestDomain = {
  insertDeploymentRequest: async (
    deploymentRequest: DeploymentRequestInitializer
  ) => {
    const [createdDeploymentRequest] = await dbUnsecure<DeploymentRequest>(
      'DeploymentRequest'
    )
      .insert(deploymentRequest)
      .returning('*');
    return createdDeploymentRequest;
  },

  loadDeploymentRequestBy: async (
    conditions: DeploymentRequestMutator
  ): Promise<DeploymentRequest> => {
    return dbUnsecure<DeploymentRequest>('DeploymentRequest')
      .where(conditions)
      .select('*')
      .first();
  },

  loadDeploymentRequests: async (opts: QueryDeploymentRequestsArgs) => {
    const { first, after, filters } = opts;
    const loadDeploymentRequestQuery = dbUnsecure<DeploymentRequest>(
      'DeploymentRequest'
    )
      .leftJoin(
        'Organization',
        'DeploymentRequest.organization_requester_id',
        '=',
        'Organization.id'
      )
      .leftJoin('User', 'DeploymentRequest.user_requester_id', '=', 'User.id')
      .select([
        'DeploymentRequest.*',
        'Organization.name as organization_name',
        'Organization.domains as organization_domains',
        'User.email as requester_email',
      ]);

    return paginate<DeploymentRequest, DeploymentRequestConnection>(
      'DeploymentRequest',
      {
        first,
        after,
        orderBy: 'id',
        orderMode: 'asc',
        filters,
      },
      undefined,
      loadDeploymentRequestQuery
    );
  },

  deleteDeploymentRequestBy: async (
    conditions: DeploymentRequestMutator
  ): Promise<DeploymentRequest> => {
    return dbUnsecure<DeploymentRequest>('DeploymentRequest')
      .where(conditions)
      .delete();
  },
};
