import { db, paginate } from '../../../../knexfile';
import {
  DeploymentRequestConnection,
  DeploymentType,
  HubStatus,
  PlatformIdentifier,
  PlatformRegion,
  PlatformState,
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
    const [createdDeploymentRequest] = await db<DeploymentRequest>(
      'DeploymentRequest'
    )
      .insert(deploymentRequest)
      .returning('*');
    return createdDeploymentRequest;
  },

  loadDeploymentRequestBy: async (conditions: DeploymentRequestMutator) => {
    const result = await db<DeploymentRequest>('DeploymentRequest')
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
      hub_status: result.hub_status as HubStatus,
      target_state: result.target_state as PlatformState,
      actual_state: result.actual_state as PlatformState,
    };
  },

  loadDeploymentRequestCountByRegion: async (
    conditions: DeploymentRequestMutator
  ): Promise<Record<string, number>> => {
    const results = await db<DeploymentRequest>('DeploymentRequest')
      .where(conditions)
      .select('region')
      .count('* as count')
      .groupBy('region');

    return Object.fromEntries(
      results.map((row) => [row.region, parseInt(row.count as string, 10)])
    );
  },

  getMaxOrdering: async (): Promise<number | null> => {
    const result = await db<DeploymentRequest>('DeploymentRequest')
      .max('ordering as max')
      .first();
    return result?.max ? parseInt(result.max as string, 10) : null;
  },

  loadDeploymentRequests: async (
    opts: QueryDeploymentRequestsArgs,
    options?: { onlyOutOfSync?: boolean }
  ) => {
    const { first, after, filters } = opts;
    const query = getDeploymentRequestWithUserDataQuery();

    // If onlyOutOfSync, only return deployments with sync offset (target_state different from actual_state)
    if (options?.onlyOutOfSync) {
      query.whereRaw(
        '("DeploymentRequest"."target_state" IS DISTINCT FROM "DeploymentRequest"."actual_state")'
      );
    }

    return paginate<DeploymentRequest, DeploymentRequestConnection>(
      'DeploymentRequest',
      {
        first,
        after,
        orderBy: 'ordering',
        orderMode: 'asc',
        filters,
      },
      undefined,
      query
    );
  },

  loadFullDeploymentRequestById: async (id: DeploymentRequestId) => {
    const query = getDeploymentRequestWithUserDataQuery();
    query.where('DeploymentRequest.id', '=', id);
    return query.first();
  },

  loadProvisionedTrialDeploymentRequestByPlatformIdentifier: async (
    platformIdentifier: PlatformIdentifier
  ) => {
    return getDeploymentRequestWithUserDataQuery()
      .whereIn('DeploymentRequest.hub_status', [
        HubStatus.Active,
        HubStatus.Expired,
      ])
      .where('DeploymentRequest.type', '=', DeploymentType.Trial)
      .where('DeploymentRequest.platform_identifier', '=', platformIdentifier)
      .first();
  },

  deleteDeploymentRequestBy: async (
    conditions: DeploymentRequestMutator
  ): Promise<DeploymentRequest> => {
    return db<DeploymentRequest>('DeploymentRequest')
      .where(conditions)
      .delete();
  },

  updateDeploymentRequestById: async (
    id: DeploymentRequestId,
    data: DeploymentRequestMutator
  ): Promise<DeploymentRequest> => {
    const [deploymentRequest] = await db<DeploymentRequest>('DeploymentRequest')
      .where('id', '=', id)
      .update(data)
      .returning('*');
    return deploymentRequest;
  },
};

const getDeploymentRequestWithUserDataQuery = () => {
  return db<DeploymentRequest>('DeploymentRequest')
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
      'User.first_name as requester_first_name',
      'User.last_name as requester_last_name',
    ]);
};
