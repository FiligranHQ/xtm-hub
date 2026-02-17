import { Knex } from 'knex';
import { db, dbRaw, paginate } from '../../../../knexfile';
import {
  DeploymentRequestDeploymentType,
  DeploymentRequestHubStatus,
  DeploymentRequestPlatformRegion,
  DeploymentRequestPlatformState,
  PlatformIdentifier,
  QueryDeploymentRequestsListArgs,
} from '../../../__generated__/resolvers-types';
import { withTransaction } from '../../../context/database.context';
import DeploymentRequest, {
  DeploymentRequestId,
  DeploymentRequestInitializer,
  DeploymentRequestMutator,
} from '../../../model/kanel/public/DeploymentRequest';
import { OrganizationId } from '../../../model/kanel/public/Organization';
import { auth0Client } from '../../../thirdparty/auth0/client';
import { logApp } from '../../../utils/app-logger.util';
import { ErrorCode } from '../../../utils/error/error.code';
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

  loadTrialsForOrganization: async (
    organizationId: OrganizationId,
    identifiers?: PlatformIdentifier[]
  ) => {
    return db<DeploymentRequest[]>('DeploymentRequest')
      .where('organization_requester_id', '=', organizationId)
      .modify((qb) => {
        if (identifiers?.length) {
          qb.whereIn('platform_identifier', identifiers);
        }
      })
      .where('type', '=', DeploymentRequestDeploymentType.Trial)
      .where('counts_in_orga_quota', '=', true)
      .select('*');
  },

  getMaxOrdering: async (
    field: DeploymentRequestMutator
  ): Promise<number | null> => {
    const result = await db<DeploymentRequest>('DeploymentRequest')
      .max('ordering as max')
      .where(field)
      .first();
    return result?.max ? parseInt(result.max as string, 10) : null;
  },

  loadDeploymentRequests: async <T>(
    opts: QueryDeploymentRequestsListArgs,
    options?: { onlyOutOfSync?: boolean }
  ) => {
    const query = getDeploymentRequestWithUserDataQuery();

    // If onlyOutOfSync, only return deployments with sync offset (target_state different from actual_state)
    if (options?.onlyOutOfSync) {
      query.whereRaw(
        '("DeploymentRequest"."target_state" IS DISTINCT FROM "DeploymentRequest"."actual_state")'
      );
    }

    if (opts.searchTerm) {
      query.orWhereILike(`User.email`, `%${opts.searchTerm}%`);
      query.orWhereILike(`Organization.name`, `%${opts.searchTerm}%`);
    }

    return paginate<DeploymentRequest, T>(
      'DeploymentRequest',
      opts,
      undefined,
      query
    );
  },

  loadFullDeploymentRequestById: async (id: DeploymentRequestId) => {
    const query = getDeploymentRequestWithUserDataQuery();
    query.where('DeploymentRequest.id', '=', id);
    return query.first();
  },

  loadFullDeploymentRequestByPlatformId: async (
    platformId: string
  ): Promise<FullyQualifiedDeploymentRequest | undefined> => {
    return getDeploymentRequestWithUserDataQuery()
      .where('DeploymentRequest.platform_id', '=', platformId)
      .first();
  },

  loadTrialDeploymentRequestByPlatformIdentifierAndUserId: async (
    platformIdentifier: PlatformIdentifier,
    userId: string
  ): Promise<FullyQualifiedDeploymentRequest | undefined> => {
    return getDeploymentRequestWithUserDataQuery()
      .leftJoin(
        'User_Organization',
        'User_Organization.organization_id',
        '=',
        'Organization.id'
      )
      .where(
        'DeploymentRequest.type',
        '=',
        DeploymentRequestDeploymentType.Trial
      )
      .where('DeploymentRequest.platform_identifier', '=', platformIdentifier)
      .where('User_Organization.user_id', '=', userId)
      .orderBy('DeploymentRequest.request_date', 'desc')
      .first();
  },

  loadTrialDeploymentRequestByPlatformToken: async (
    platformToken: string
  ): Promise<FullyQualifiedDeploymentRequest> => {
    return getDeploymentRequestWithUserDataQuery()
      .where(
        'DeploymentRequest.type',
        '=',
        DeploymentRequestDeploymentType.Trial
      )
      .where('DeploymentRequest.platform_token', '=', platformToken)
      .first();
  },

  loadTrialsToExpire: async (): Promise<DeploymentRequest[]> => {
    return db<DeploymentRequest[]>('DeploymentRequest')
      .where('type', '=', DeploymentRequestDeploymentType.Trial)
      .where('end_date', '<', new Date())
      .where('hub_status', '=', DeploymentRequestHubStatus.Active)
      .select('*');
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
  ): Promise<DeploymentRequest | undefined> => {
    const [deploymentRequest] = await db<DeploymentRequest>('DeploymentRequest')
      .where('id', '=', id)
      .update(data)
      .returning('*');
    return deploymentRequest;
  },

  setFirstQueuedRequestAsPending: async (
    platformIdentifier: PlatformIdentifier,
    region: DeploymentRequestPlatformRegion
  ): Promise<DeploymentRequest | undefined> => {
    const request = await db<DeploymentRequest>('DeploymentRequest')
      .select('*')
      .where('hub_status', '=', DeploymentRequestHubStatus.Queued)
      .andWhere('platform_identifier', '=', platformIdentifier)
      .andWhere('region', '=', region)
      .orderBy('ordering', 'asc')
      .first();

    if (!request) {
      return undefined;
    }

    const maxPendingOrdering = await DeploymentRequestDomain.getMaxOrdering({
      hub_status: DeploymentRequestHubStatus.Pending,
      platform_identifier: platformIdentifier,
    });

    const [updatedRequest] = await db<DeploymentRequest>('DeploymentRequest')
      .update({
        hub_status: DeploymentRequestHubStatus.Pending,
        target_state: DeploymentRequestPlatformState.Active,
        ordering: (maxPendingOrdering ?? 0) + 1,
      })
      .where('id', '=', request.id)
      .returning('*');
    return updatedRequest ?? undefined;
  },

  setLastPendingRequestAsQueued: async (
    platformIdentifier: PlatformIdentifier,
    region: DeploymentRequestPlatformRegion
  ): Promise<DeploymentRequest | undefined> => {
    const request = await db<DeploymentRequest>('DeploymentRequest')
      .select('*')
      .where('hub_status', '=', DeploymentRequestHubStatus.Pending)
      .andWhere('platform_identifier', '=', platformIdentifier)
      .andWhere('region', '=', region)
      .orderBy('ordering', 'desc')
      .first();

    if (!request) {
      return undefined;
    }

    await db<DeploymentRequest>('DeploymentRequest')
      .increment('ordering', 1)
      .where('hub_status', '=', DeploymentRequestHubStatus.Queued)
      .andWhere('platform_identifier', '=', platformIdentifier);
    const [updatedRequest] = await db<DeploymentRequest>('DeploymentRequest')
      .update({
        hub_status: DeploymentRequestHubStatus.Queued,
        target_state: DeploymentRequestPlatformState.Removed,
        ordering: 1,
      })
      .where({ id: request.id })
      .returning('*');

    return updatedRequest;
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

  reorderDeploymentRequestUp: async (deploymentRequest: DeploymentRequest) => {
    const previousDeploymentRequest = await db<DeploymentRequest>(
      'DeploymentRequest'
    )
      .where('ordering', '<', deploymentRequest.ordering)
      .andWhere('hub_status', '=', DeploymentRequestHubStatus.Queued)
      .andWhere(
        'platform_identifier',
        '=',
        deploymentRequest.platform_identifier
      )
      .select('*')
      .orderBy('ordering', 'desc')
      .first();

    const isDeploymentRequestFirst = !previousDeploymentRequest;
    if (isDeploymentRequestFirst) {
      return;
    }

    await withTransaction(async () => {
      await db<DeploymentRequest>('DeploymentRequest')
        .update({ ordering: deploymentRequest.ordering })
        .where({ id: previousDeploymentRequest.id });

      await db<DeploymentRequest>('DeploymentRequest')
        .update({ ordering: previousDeploymentRequest.ordering })
        .where({ id: deploymentRequest.id });
    });
  },

  reorderDeploymentRequestToTop: async ({
    id,
    platform_identifier,
  }: DeploymentRequest) => {
    const topDeploymentRequest = await db<DeploymentRequest>(
      'DeploymentRequest'
    )
      .where('hub_status', '=', DeploymentRequestHubStatus.Queued)
      .andWhere('platform_identifier', '=', platform_identifier)
      .orderBy('ordering', 'asc')
      .first();
    if (!topDeploymentRequest) {
      throw new Error(ErrorCode.DeploymentRequestNotFound);
    }

    const isDeploymentRequestAlreadyOnTop = topDeploymentRequest.id === id;
    if (isDeploymentRequestAlreadyOnTop) {
      return;
    }

    await withTransaction(async () => {
      await db<DeploymentRequest>('DeploymentRequest')
        .increment('ordering', 1)
        .where('hub_status', '=', DeploymentRequestHubStatus.Queued)
        .andWhere('platform_identifier', '=', platform_identifier);
      await DeploymentRequestDomain.updateDeploymentRequestById(id, {
        ordering: 1,
      });
    });
  },
};

export type FullyQualifiedDeploymentRequest = DeploymentRequest & {
  organization_name: string;
  organization_domains: string[];
  requester_email: string;
  requester_first_name: string;
  requester_last_name: string;
};

const getDeploymentRequestWithUserDataQuery =
  (): Knex.QueryBuilder<FullyQualifiedDeploymentRequest> => {
    return db<DeploymentRequest>('DeploymentRequest')
      .leftJoin(
        'Organization',
        'DeploymentRequest.organization_requester_id',
        '=',
        'Organization.id'
      )
      .leftJoin('User', 'DeploymentRequest.user_requester_id', '=', 'User.id')
      .leftJoin(
        'User as CancellationUser',
        'DeploymentRequest.cancellation_user_id',
        '=',
        'CancellationUser.id'
      )
      .leftJoin(
        'Service_Configuration',
        'DeploymentRequest.service_instance_id',
        '=',
        'Service_Configuration.service_instance_id'
      )
      .select([
        'DeploymentRequest.*',
        'Organization.name as organization_name',
        'Organization.domains as organization_domains',
        'User.email as requester_email',
        'User.first_name as requester_first_name',
        'User.last_name as requester_last_name',
        'CancellationUser.email as cancellation_user_email',
        dbRaw(
          `"Service_Configuration"."config"->>'platform_url' as platform_url`
        ),
      ]);
  };
