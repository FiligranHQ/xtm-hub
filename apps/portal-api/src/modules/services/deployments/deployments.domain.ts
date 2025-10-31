import { dbUnsecure, paginate } from '../../../../knexfile';
import {
  DeploymentRequestConnection,
  DeploymentRequestStatus,
  DeploymentType,
  PlatformIdentifier,
  PlatformRegion,
  QueryDeploymentRequestsArgs,
} from '../../../__generated__/resolvers-types';
import DeploymentRequest, {
  DeploymentRequestId,
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

  loadDeploymentRequestBy: async (conditions: DeploymentRequestMutator) => {
    const result = await dbUnsecure<DeploymentRequest>('DeploymentRequest')
      .where(conditions)
      .select('*')
      .first();

    if (!result) {
      return null;
    }

    return {
      ...result,
      platform_identifier: result.platform_identifier as PlatformIdentifier,
      region: result.region as PlatformRegion,
      type: result.type as DeploymentType,
      status: result.status as DeploymentRequestStatus,
    };
  },

  loadDeploymentRequestCountByRegion: async (
    conditions: DeploymentRequestMutator
  ): Promise<Record<string, number>> => {
    const results = await dbUnsecure<DeploymentRequest>('DeploymentRequest')
      .where(conditions)
      .select('region')
      .count('* as count')
      .groupBy('region');

    return Object.fromEntries(
      results.map((row) => [row.region, parseInt(row.count as string, 10)])
    );
  },

  loadDeploymentRequests: async (opts: QueryDeploymentRequestsArgs) => {
    const { first, after, filters } = opts;
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
      getDeploymentRequestWithUserDataQuery()
    );
  },

  loadFullDeploymentRequestById: async (id: DeploymentRequestId) => {
    const query = getDeploymentRequestWithUserDataQuery();
    query.where('DeploymentRequest.id', '=', id);
    return query.first();
  },

  deleteDeploymentRequestBy: async (
    conditions: DeploymentRequestMutator
  ): Promise<DeploymentRequest> => {
    return dbUnsecure<DeploymentRequest>('DeploymentRequest')
      .where(conditions)
      .delete();
  },

  updateDeploymentRequestById: async (
    id: DeploymentRequestId,
    data: DeploymentRequestMutator
  ): Promise<DeploymentRequest> => {
    const [deploymentRequest] = await dbUnsecure<DeploymentRequest>(
      'DeploymentRequest'
    )
      .where('id', '=', id)
      .update(data)
      .returning('*');
    return deploymentRequest;
  },
};

const getDeploymentRequestWithUserDataQuery = () => {
  return dbUnsecure<DeploymentRequest>('DeploymentRequest')
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
};
