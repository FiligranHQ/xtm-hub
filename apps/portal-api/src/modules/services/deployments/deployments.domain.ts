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
import { auth0Client } from '../../../thirdparty/auth0/client';
import { logApp } from '../../../utils/app-logger.util';
import { ServiceGroupDomain } from '../group/service-group.domain';

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
        orderBy: 'request_date',
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

  loadProvisionedTrialDeploymentRequestByPlatformIdentifier: async (
    platformIdentifier: PlatformIdentifier
  ) => {
    return getDeploymentRequestWithUserDataQuery()
      .whereIn('DeploymentRequest.status', [
        DeploymentRequestStatus.Active,
        DeploymentRequestStatus.Expired,
      ])
      .where('DeploymentRequest.type', '=', DeploymentType.Trial)
      .where('DeploymentRequest.platform_identifier', '=', platformIdentifier)
      .first();
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
  initialiseServiceGroup: async (id: DeploymentRequestId) => {
    const {
      organization_name,
      requester_email,
      product_service_instance_id,
      user_requester_id,
      service_instance_id,
    } = await DeploymentRequestDomain.loadFullDeploymentRequestById(id);

    try {
      await auth0Client.createAudienceAPI(
        organization_name,
        product_service_instance_id
      );
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
        [product_service_instance_id]: {
          groups: ['Admin'],
        },
      });
    }
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
      'User.first_name as requester_first_name',
      'User.last_name as requester_last_name',
    ]);
};
