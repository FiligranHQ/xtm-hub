import { v4 as uuidv4 } from 'uuid';
import { db, paginate, QueryOpts } from '../../../knexfile';
import {
  SubscriptionConnection,
  SubscriptionModel,
  SubscriptionOrdering,
} from '../../__generated__/resolvers-types';
import { withTransaction } from '../../context/database.context';
import { OrganizationId } from '../../model/kanel/public/Organization';
import { ServiceCapabilityId } from '../../model/kanel/public/ServiceCapability';
import { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import Subscription, {
  SubscriptionId,
} from '../../model/kanel/public/Subscription';
import { UserLoadUserBy } from '../../model/user';
import { logApp } from '../../utils/app-logger.util';
import { ErrorCode, NotFoundErrorCode } from '../../utils/error/error.code';
import { SubscriptionCapabilityDomain } from '../security-management/subscription-capability/subscription-capability.domain';
import { SubscriptionDomain } from './subscription.domain';

export const subscriptionApp = {
  loadSubscriptionModel: async (
    user: UserLoadUserBy,
    service_instance_id: ServiceInstanceId
  ): Promise<SubscriptionModel> => {
    const subscription = await SubscriptionDomain.loadSubscriptionBy({
      service_instance_id,
      organization_id: user.selected_organization_id,
    });

    return subscription as unknown as SubscriptionModel;
  },

  subscribeOrganizationsToService: async ({
    organizationIds,
    serviceInstanceId,
    startDate,
    endDate,
    capabilityIds,
  }: {
    organizationIds: OrganizationId[];
    serviceInstanceId: ServiceInstanceId;
    startDate: Date;
    endDate: Date | null;
    capabilityIds: ServiceCapabilityId[];
  }): Promise<Subscription[]> => {
    const createdSubscriptions: Subscription[] = [];
    return withTransaction(async () => {
      for (const organizationId of organizationIds) {
        await assertOrganizationIsNotAlreadySubscribed({
          serviceInstanceId,
          organizationId,
        });

        const createdSubscription = await SubscriptionDomain.createSubscription(
          {
            id: uuidv4() as SubscriptionId,
            service_instance_id: serviceInstanceId,
            organization_id: organizationId,
            start_date: startDate,
            end_date: endDate,
          }
        );

        await SubscriptionCapabilityDomain.addCapabilitiesToSubscription(
          createdSubscription.id,
          capabilityIds
        );
        createdSubscriptions.push(createdSubscription);
      }

      return createdSubscriptions;
    });
  },

  deleteSubscriptions: async (
    ids: SubscriptionId[]
  ): Promise<Subscription[]> => {
    return SubscriptionDomain.deleteSubscriptions(ids);
  },

  updateSubscription: async ({
    id,
    startDate,
    endDate,
    capabilityIds,
  }: {
    id: SubscriptionId;
    startDate?: Date;
    endDate?: Date;
    capabilityIds?: ServiceCapabilityId[];
  }): Promise<Subscription> => {
    return withTransaction(async () => {
      const data: Partial<Subscription> = {};
      if (startDate !== undefined) data.start_date = startDate;
      if (endDate !== undefined) data.end_date = endDate;

      let updatedSubscription: Subscription | undefined;
      if (Object.keys(data).length > 0) {
        const [result] = await SubscriptionDomain.updateSubscriptionBy(
          { id },
          data
        );
        updatedSubscription = result;
      } else {
        updatedSubscription = await SubscriptionDomain.loadSubscriptionBy({
          id,
        });
      }
      if (!updatedSubscription) {
        throw new Error(NotFoundErrorCode.SubscriptionNotFound);
      }

      if (capabilityIds !== undefined) {
        await SubscriptionCapabilityDomain.replaceCapabilitiesForSubscription(
          id,
          capabilityIds
        );
      }

      return updatedSubscription;
    });
  },

  loadSubscriptions: async (opts: QueryOpts) => {
    const { filters, searchTerm, orderBy } = opts;
    const subscriptionOrderBy = getSubscriptionOrdering(orderBy);
    const queryContext = db<Subscription>('Subscription');
    const normalizedSearchTerm = searchTerm?.trim();
    const shouldJoinOrganization =
      normalizedSearchTerm !== undefined && normalizedSearchTerm.length > 0
        ? true
        : subscriptionOrderBy === SubscriptionOrdering.OrganizationName;
    const shouldJoinServiceInstanceAndDefinition =
      normalizedSearchTerm !== undefined && normalizedSearchTerm.length > 0
        ? true
        : subscriptionOrderBy === SubscriptionOrdering.ServiceName ||
          subscriptionOrderBy === SubscriptionOrdering.ServiceDescription ||
          subscriptionOrderBy === SubscriptionOrdering.ServiceProvider ||
          subscriptionOrderBy === SubscriptionOrdering.ServiceType;

    if (shouldJoinOrganization) {
      queryContext.leftJoin(
        'Organization',
        'Organization.id',
        'Subscription.organization_id'
      );
    }
    if (shouldJoinServiceInstanceAndDefinition) {
      queryContext
        .leftJoin(
          'ServiceInstance',
          'ServiceInstance.id',
          'Subscription.service_instance_id'
        )
        .leftJoin(
          'ServiceDefinition',
          'ServiceDefinition.id',
          'ServiceInstance.service_definition_id'
        );
    }

    if (normalizedSearchTerm) {
      queryContext.andWhere((qb) => {
        qb.whereILike('Organization.name', `%${normalizedSearchTerm}%`)
          .orWhereILike('ServiceInstance.name', `%${normalizedSearchTerm}%`)
          .orWhereILike(
            'ServiceDefinition.identifier',
            `%${normalizedSearchTerm}%`
          )
          .orWhereILike(
            'ServiceInstance.creation_status',
            `%${normalizedSearchTerm}%`
          )
          .orWhereRaw(
            `EXISTS (
              SELECT 1
              FROM unnest("ServiceInstance"."tags"::text[]) AS tag
              WHERE LOWER(tag) = LOWER(?)
            )`,
            [normalizedSearchTerm]
          );
      });
    }

    return paginate<Subscription, SubscriptionConnection>(
      'Subscription',
      {
        ...opts,
        orderBy: mapSubscriptionOrderingToColumn(subscriptionOrderBy),
        filters,
        searchTerm: undefined,
      },
      {},
      queryContext
    );
  },
};

const subscriptionOrderings = new Set(Object.values(SubscriptionOrdering));
const getSubscriptionOrdering = (
  orderBy: string | null | undefined
): SubscriptionOrdering => {
  if (orderBy && subscriptionOrderings.has(orderBy as SubscriptionOrdering)) {
    return orderBy as SubscriptionOrdering;
  }
  return SubscriptionOrdering.StartDate;
};

const mapSubscriptionOrderingToColumn = (orderBy: SubscriptionOrdering) => {
  switch (orderBy) {
    case SubscriptionOrdering.OrganizationName:
      return 'Organization.name';
    case SubscriptionOrdering.StartDate:
      return 'Subscription.start_date';
    case SubscriptionOrdering.EndDate:
      return 'Subscription.end_date';
    case SubscriptionOrdering.ServiceName:
      return 'ServiceInstance.name';
    case SubscriptionOrdering.ServiceDescription:
      return 'ServiceDefinition.description';
    case SubscriptionOrdering.ServiceType:
      return 'ServiceDefinition.identifier';
    case SubscriptionOrdering.ServiceProvider:
      return 'ServiceDefinition.name';
    default:
      return 'Subscription.start_date';
  }
};

const assertOrganizationIsNotAlreadySubscribed = async ({
  serviceInstanceId,
  organizationId,
}: {
  serviceInstanceId: ServiceInstanceId;
  organizationId: OrganizationId;
}) => {
  const subscription = await SubscriptionDomain.loadSubscriptionBy({
    organization_id: organizationId,
    service_instance_id: serviceInstanceId,
  });

  if (subscription) {
    logApp.warn(
      'Forbidden access while adding subscription: you have already subscribed this service.'
    );

    throw new Error(ErrorCode.AlreadySubscribed);
  }
};
