import { Knex } from 'knex';
import { db, paginate } from '../../../../knexfile';
import {
  DeploymentRequestConnection,
  DeploymentRequestDeploymentType,
  DeploymentRequestHubStatus,
  DeploymentRequestPlatformRegion,
  DeploymentRequestPlatformState,
  PlatformIdentifier,
  QueryDeploymentRequestsArgs,
} from '../../../__generated__/resolvers-types';
import DeploymentRequest, {
  DeploymentRequestId,
  DeploymentRequestInitializer,
  DeploymentRequestMutator,
} from '../../../model/kanel/public/DeploymentRequest';
import { auth0Client } from '../../../thirdparty/auth0/client';
import { logApp } from '../../../utils/app-logger.util';
import { ServiceGroupDomain } from '../group/service-group.domain';

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
      region: result.region as DeploymentRequestPlatformRegion,
      type: result.type as DeploymentRequestDeploymentType,
      hub_status: result.hub_status as DeploymentRequestHubStatus,
      target_state: result.target_state as DeploymentRequestPlatformState,
      actual_state: result.actual_state as DeploymentRequestPlatformState,
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
    platformIdentifier: PlatformIdentifier,
    userId: string
  ) => {
    return getDeploymentRequestWithUserDataQuery()
      .leftJoin(
        'User_Organization',
        'User_Organization.user_id',
        '=',
        'Organization.id'
      )
      .whereIn('DeploymentRequest.hub_status', [
        DeploymentRequestHubStatus.Active,
        DeploymentRequestHubStatus.Expired,
      ])
      .where(
        'DeploymentRequest.type',
        '=',
        DeploymentRequestDeploymentType.Trial
      )
      .where('DeploymentRequest.platform_identifier', '=', platformIdentifier)
      .where('User_Organization.user_id', '=', userId)
      .first();
  },

  loadProvisionedTrialDeploymentRequestByPlatformToken: async (
    platformToken: string
  ) => {
    return getDeploymentRequestWithUserDataQuery()
      .whereIn('DeploymentRequest.hub_status', [
        DeploymentRequestHubStatus.Active,
        DeploymentRequestHubStatus.Expired,
      ])
      .where(
        'DeploymentRequest.type',
        '=',
        DeploymentRequestDeploymentType.Trial
      )
      .where('DeploymentRequest.platform_token', '=', platformToken)
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
  initialiseServiceGroup: async (id: DeploymentRequestId) => {
    const {
      organization_name,
      requester_email,
      platform_id,
      user_requester_id,
      service_instance_id,
    } = await DeploymentRequestDomain.loadFullDeploymentRequestById(id);

    try {
      await auth0Client.createAudienceAPI(organization_name, platform_id);
    } catch (error) {
      logApp.warn(`Auth0 Create Audience: ${error}`);
    }

    const serviceGroup = await ServiceGroupDomain.loadServiceGroups({
      service_instance_id: service_instance_id,
    });
    if (serviceGroup.length === 0) {
      await ServiceGroupDomain.initGroupWithAdmin(
        user_requester_id,
        service_instance_id
      );
      await auth0Client.updateUserRBACInstance(requester_email, {
        [platform_id]: {
          groups: ['Admin'],
        },
      });
    }
  },
};

const getDeploymentRequestWithUserDataQuery = (): Knex.QueryBuilder<
  DeploymentRequest & {
    organization_name: string;
    organization_domains: string[];
    requester_email: string;
    requester_first_name: string;
    requester_last_name: string;
  }
> => {
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
