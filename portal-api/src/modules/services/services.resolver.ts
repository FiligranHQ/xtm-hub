import {
  Resolvers,
  Service,
  ServiceLink,
  Subscription,
} from '../../__generated__/resolvers-types';
import { DatabaseType, db, dbTx } from '../../../knexfile';
import { v4 as uuidv4 } from 'uuid';
import { dispatch, listen } from '../../pub';
import { fromGlobalId, toGlobalId } from 'graphql-relay/node/node.js';
import ServicePrice, {
  ServicePriceId,
} from '../../model/kanel/public/ServicePrice';
import { ServiceId } from '../../model/kanel/public/Service';
import { ServiceLinkId } from '../../model/kanel/public/ServiceLink';
import { SubscriptionId } from '../../model/kanel/public/Subscription';
import { loadOrganizationBy } from '../organizations/organizations.helper';
import {
  addServiceLink,
  addSubscriptions,
  adminCreateCommu,
  findCurrentCommuAdminId,
  grantServiceAccess,
  grantServiceAdminAccess,
  insertService,
  loadCommunities,
  loadPublicServices,
  orgaCreateCommu,
} from './services.domain';
import { insertServicePrice } from './instances/service-price/service_price.helper';
import { isAdmin } from '../role-portal/role-portal.domain';
import { loadUsersByOrganization } from '../users/users.domain';
import User from '../../model/kanel/public/User';
import { GraphQLError } from 'graphql/error/index.js';

const resolvers: Resolvers = {
  Query: {
    services: async (_, opt, context) => {
      return loadPublicServices(context, opt);
    },
    communities: async (_, opt, context) => {
      return loadCommunities(context, opt);
    },
  },
  Mutation: {
    deleteService: async (_, { id }, context) => {
      const { id: databaseId } = fromGlobalId(id) as {
        type: DatabaseType;
        id: string;
      };
      const [deletedService] = await db<Service>(context, 'Service')
        .where({ id: databaseId })
        .delete('*');
      await dispatch('Service', 'delete', deletedService);
      return deletedService;
    },
    editService: async (_, { id, name }, context) => {
      const { id: databaseId } = fromGlobalId(id) as {
        type: DatabaseType;
        id: string;
      };
      const [updatedService] = await db<Service>(context, 'Service')
        .where({ id: databaseId })
        .update({ name })
        .returning('*');
      await dispatch('Service', 'edit', updatedService);
      return updatedService;
    },
    addService: async (_, { input }, context) => {
      const trx = await dbTx();

      try {
        const dataService = {
          id: uuidv4(),
          name: input.service_name,
          description: input.service_description,
          provider: 'SCRED_ONDEMAND',
          type: 'PRIVATE',
          creation_status: 'READY',
          subscription_service_type: 'SUBSCRIPTABLE_BACKOFFICE',
        };
        const [addedService] = await db<Service>(context, 'Service')
          .insert(dataService)
          .returning('*');

        const dataServicePrice = {
          id: uuidv4() as unknown as ServicePriceId,
          service_id: addedService.id as unknown as ServiceId,
          fee_type: input.fee_type,
          start_date: new Date(),
          price: input.price,
        };

        await db<ServicePrice>(context, 'Service_Price')
          .insert(dataServicePrice)
          .returning('*');

        const dataServiceLink = {
          id: uuidv4() as unknown as ServiceLinkId,
          service_id: addedService.id as unknown as ServiceId,
          url: input.url,
          name: input.service_name,
        };

        await db<ServiceLink>(context, 'Service_Link')
          .insert(dataServiceLink)
          .returning('*');
        await dispatch('Service', 'add', addedService);

        const dataSubscription = {
          id: uuidv4() as unknown as SubscriptionId,
          organization_id: fromGlobalId(input.organization_id).id,
          service_id: addedService.id,
          start_date: new Date(),
          end_date: null,
          status: 'ACCEPTED',
        };

        const [addedSubscription] = await db<Subscription>(
          context,
          'Subscription'
        )
          .insert(dataSubscription)
          .returning('*');
        addedSubscription.organization = await loadOrganizationBy(
          context,
          'id',
          fromGlobalId(input.organization_id).id
        );
        addedSubscription.service = addedService;

        return addedSubscription;
      } catch (error) {
        await trx.rollback();
        console.log('Error while adding the new service.', error);
        throw error;
      }
    },
    addServiceCommunity: async (_, { input }, context) => {
      const isUserAdmin = await isAdmin(context);

      const trx = await dbTx();
      try {
        const dataService = {
          id: uuidv4(),
          name: input.community_name,
          description: input.community_description,
          provider: 'SCRED_ONDEMAND',
          type: 'COMMUNITY',
          creation_status: isUserAdmin ? 'READY' : 'PENDING',
          subscription_service_type: 'SUBSCRIPTABLE_DIRECT',
        };
        const [addedService] = await insertService(context, dataService);

        const dataServicePrice = {
          id: uuidv4() as unknown as ServicePriceId,
          service_id: addedService.id as unknown as ServiceId,
          fee_type: input.fee_type,
          start_date: new Date(),
          price: input.price,
        };
        await insertServicePrice(context, dataServicePrice);

        const services = ['OCTI', 'Nextcloud'];
        for (const serviceLink of services) {
          const dataServiceLink = {
            id: uuidv4() as ServiceLinkId,
            service_id: addedService.id as ServiceId,
            name: serviceLink,
          };
          // TODO Call AWX to add service to community
          await addServiceLink(context, dataServiceLink);
        }

        const userId = input.billing_manager
          ? fromGlobalId(JSON.parse(input.billing_manager).id).id
          : context.user.id;

        if (
          input.billing_manager &&
          !input.organizations_id.some(
            (id) =>
              fromGlobalId(JSON.parse(input.billing_manager).organization_id)
                .id === fromGlobalId(id).id
          )
        ) {
          throw new GraphQLError(
            'The billing manager and the organization should be the same.',
            {
              extensions: { code: '[Services] addServiceCommunity' },
            }
          );
        }

        if (isUserAdmin) {
          await adminCreateCommu(
            context,
            input.organizations_id ?? [],
            addedService.id as ServiceId,
            userId
          );
        } else {
          await orgaCreateCommu(
            context,
            [toGlobalId('Organization', context.user.organization_id)],
            addedService.id as ServiceId,
            input.justification
          );
        }

        await grantServiceAdminAccess(context, userId, addedService.id);

        return addedService;
      } catch (error) {
        await trx.rollback();
        console.log('Error while adding the new community.', error);
        throw error;
      }
    },
    acceptCommunity: async (_, { input }, context) => {
      const trx = await dbTx();
      try {
        const { adminCommuId, adminsSubscription } =
          await findCurrentCommuAdminId(
            fromGlobalId(input.serviceId).id as ServiceId
          );

        const addedSubscriptions = await addSubscriptions(
          context,
          fromGlobalId(input.serviceId).id as ServiceId,
          input.organizationsId,
          'ACCEPTED'
        );

        for (const addedSubscription of addedSubscriptions) {
          const users = (await loadUsersByOrganization(
            addedSubscription.organization_id,
            adminCommuId
          )) as User[];
          await grantServiceAccess(
            context,
            ['ACCESS_SERVICE'],
            users.map(({ id }) => id),
            addedSubscription.id
          );
        }

        // ADMIN
        // Update its current subscription to set 100% billing
        await db<Subscription>(context, 'Subscription')
          .where({ id: adminsSubscription.id })
          .update({ billing: 100, status: 'ACCEPTED' })
          .returning('*');

        // Grant all users access in admin's organization.
        const users = (await loadUsersByOrganization(
          adminsSubscription.organization_id,
          adminCommuId
        )) as User[];
        await grantServiceAccess(
          context,
          ['ACCESS_SERVICE'],
          users.map(({ id }) => id),
          adminsSubscription.id
        );
        return addedSubscriptions;
      } catch (error) {
        await trx.rollback();
        console.log('Error while accepting the service.', error);
        throw error;
      }
    },
  },
  Subscription: {
    Service: {
      subscribe: (_, __, context) => ({
        [Symbol.asyncIterator]: () => listen(context, ['Service']),
      }),
    },
  },
};

export default resolvers;
