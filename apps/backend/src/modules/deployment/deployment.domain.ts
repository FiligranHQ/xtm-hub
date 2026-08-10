import { Knex } from 'knex';
import { db, paginate } from '../../../knexfile';
import {
  DeploymentRequestDeploymentType,
  DeploymentRequestHubStatus,
  DeploymentRequestPlatformRegion,
  DeploymentRequestPlatformState,
  PlatformIdentifier,
  QueryDeploymentRequestsListArgs,
} from '../../__generated__/resolvers-types';
import { withTransaction } from '../../context/database.context';
import DeploymentRequest, {
  DeploymentRequestId,
  DeploymentRequestInitializer,
  DeploymentRequestMutator,
} from '../../model/kanel/public/DeploymentRequest';
import { OrganizationId } from '../../model/kanel/public/Organization';
import { auth0Client } from '../../thirdparty/auth0/client';
import { logApp } from '../../utils/app-logger.util';
import { ErrorCode, UnknownErrorCode } from '../../utils/error/error.code';
import { prefixObjectKeys } from '../../utils/utils';
import {
  ServiceGroupDomain,
  ServiceGroupName,
} from './group/service-group.domain';

export const DeploymentRequestDomain = {
  insertDeploymentRequest: async (
    deploymentRequest: DeploymentRequestInitializer
  ): Promise<DeploymentRequest> => {
    const [createdDeploymentRequest] = await db<DeploymentRequest>(
      'DeploymentRequest'
    )
      .insert(deploymentRequest)
      .returning('*');
    if (!createdDeploymentRequest) {
      throw new Error(UnknownErrorCode.CreateDeploymentRequestError);
    }
    return createdDeploymentRequest;
  },

  loadDeploymentRequestBy: async (
    conditions: DeploymentRequestMutator
  ): Promise<DeploymentRequest | undefined> => {
    return db<DeploymentRequest>('DeploymentRequest')
      .where(conditions)
      .select('*')
      .first();
  },

  loadDeploymentRequestsBy: async (
    conditions: DeploymentRequestMutator
  ): Promise<DeploymentRequest[]> => {
    return db<DeploymentRequest[]>('DeploymentRequest')
      .where(conditions)
      .select('*');
  },

  loadTrialsForOrganization: async (
    organizationId: OrganizationId,
    identifiers?: PlatformIdentifier[]
  ): Promise<DeploymentRequest[]> => {
    return db<DeploymentRequest>('DeploymentRequest')
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
      query.where((qb) => {
        qb.whereILike(`User.email`, `%${opts.searchTerm}%`).orWhereILike(
          `Organization.name`,
          `%${opts.searchTerm}%`
        );
      });
    }

    return paginate<FullyQualifiedDeploymentRequest, T>(
      'DeploymentRequest',
      opts,
      undefined,
      query
    );
  },

  loadFullDeploymentRequest: async (
    conditions: DeploymentRequestMutator
  ): Promise<FullyQualifiedDeploymentRequest | undefined> => {
    return getDeploymentRequestWithUserDataQuery()
      .where(prefixObjectKeys(conditions, 'DeploymentRequest.'))
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
    platformIdentifier: PlatformIdentifier | null,
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

  initialiseServiceGroup: async (
    id: DeploymentRequestId,
    platformIdentifier: PlatformIdentifier | null
  ) => {
    if (!platformIdentifier) {
      throw new Error(UnknownErrorCode.UnknownError);
    }

    const fullDeploymentRequest =
      await DeploymentRequestDomain.loadFullDeploymentRequest({ id });

    if (!fullDeploymentRequest) {
      throw new Error(ErrorCode.DeploymentRequestNotFound);
    }

    const {
      organization_name,
      requester_email,
      platform_id,
      user_requester_id,
      service_instance_id,
    } = fullDeploymentRequest;
    if (!platform_id) {
      throw new Error(ErrorCode.InvalidPlatformId);
    }

    if (platformIdentifier !== PlatformIdentifier.Openaev) {
      try {
        await auth0Client.createAudienceAPI(organization_name, platform_id);
      } catch (error) {
        logApp.warn('Unable to create audience', {
          error,
          deploymentRequestId: id,
        });
      }
    }

    const serviceGroup = await ServiceGroupDomain.loadServiceGroups({
      service_instance_id: service_instance_id,
    });
    if (serviceGroup.length === 0) {
      await ServiceGroupDomain.initGroupWithAdmin(
        user_requester_id,
        service_instance_id,
        platformIdentifier
      );
      await auth0Client.updateUserRBACInstance(requester_email, {
        [platform_id]: {
          groups: [ServiceGroupName.Admin],
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
        'PlatformConfiguration',
        'DeploymentRequest.service_instance_id',
        '=',
        'PlatformConfiguration.service_instance_id'
      )
      .select([
        'DeploymentRequest.*',
        'Organization.name as organization_name',
        'Organization.domains as organization_domains',
        'User.email as requester_email',
        'User.first_name as requester_first_name',
        'User.last_name as requester_last_name',
        'CancellationUser.email as cancellation_user_email',
        'PlatformConfiguration.platform_url as platform_url',
      ]);
  };
