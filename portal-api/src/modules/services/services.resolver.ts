import {
  Resolvers,
  Service,
  ServiceCapability,
  ServiceLink,
  Subscription,
  UserService,
} from '../../__generated__/resolvers-types';
import { DatabaseType, db, dbTx } from '../../../knexfile';
import { v4 as uuidv4 } from 'uuid';
import { dispatch, listen } from '../../pub';
import { fromGlobalId } from 'graphql-relay/node/node.js';
import ServicePrice, {
  ServicePriceId,
} from '../../model/kanel/public/ServicePrice';
import { ServiceId } from '../../model/kanel/public/Service';
import { ServiceLinkId } from '../../model/kanel/public/ServiceLink';
import { SubscriptionId } from '../../model/kanel/public/Subscription';
import { loadOrganizationBy } from '../organizations/organizations';
import {
  addServiceLink,
  loadCommunities,
  loadPublicServices,
} from './services.domain';
import { getRolePortalBy } from '../role-portal/role-portal';
import { loadUserBy, loadUsersByOrganization } from '../users/users.domain';
import { UserServiceId } from '../../model/kanel/public/UserService';
import { ServiceCapabilityId } from '../../model/kanel/public/ServiceCapability';

const resolvers: Resolvers = {
  Query: {
    services: async (_, opt, context) => {
      const shouldReturnPrivateServices = context.user.capabilities.some(
        (capability) => !capability.name.includes('BYPASS')
      );

      return loadPublicServices(context, opt, shouldReturnPrivateServices);
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
      const role = await getRolePortalBy(
        context,
        'id',
        context.user.roles_portal_id[0].id
      );

      const trx = await dbTx();
      try {
        const dataService = {
          id: uuidv4(),
          name: input.community_name,
          description: input.community_description,
          provider: 'SCRED_ONDEMAND',
          type: 'COMMUNITY',
          creation_status: role.name === 'ADMIN' ? 'READY' : 'PENDING',
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

        let dataSubscription;

        let userBillingManager;
        if (role.name === 'ADMIN' && input.billing_manager) {
          userBillingManager = await loadUserBy(
            'User.email',
            input.billing_manager
          );
        }

        for (const organization_id of input.organizations_id) {
          dataSubscription = {
            id: uuidv4() as unknown as SubscriptionId,
            organization_id: fromGlobalId(organization_id).id,
            service_id: addedService.id,
            start_date: new Date(),
            end_date: null,
            status: role.name === 'ADMIN' ? 'ACCEPTED' : 'REQUESTED',
            subscriber_id:
              role.name === 'ADMIN' ? userBillingManager.id : context.user.id,
          };

          const [addedSubscription] = await db<Subscription>(
            context,
            'Subscription'
          )
            .insert(dataSubscription)
            .returning('*');

          const users = await loadUsersByOrganization(
            fromGlobalId(organization_id).id,
            userBillingManager.id
          );
          for (const user of users) {
            const dataUserService = {
              id: uuidv4() as UserServiceId,
              user_id: user.id,
              subscription_id: addedSubscription.id,
            };

            const [insertedUserService] = await db<UserService>(
              context,
              'User_Service'
            )
              .insert(dataUserService)
              .returning('*');

            const dataServiceCapability = {
              id: uuidv4() as ServiceCapabilityId,
              user_service_id: insertedUserService.id,
              service_capability_name: 'ACCESS_SERVICE',
            };

            await db<ServiceCapability>(context, 'Service_Capability')
              .insert(dataServiceCapability)
              .returning('*');
          }

          const dataUserService = {
            id: uuidv4() as UserServiceId,
            user_id: userBillingManager.id,
            subscription_id: addedSubscription.id,
          };

          const [insertedUserService] = await db<UserService>(
            context,
            'User_Service'
          )
            .insert(dataUserService)
            .returning('*');

          const capabilities = [
            'ADMIN_SUBSCRIPTION',
            'MANAGE_ACCESS',
            'ACCESS_SERVICE',
          ];
          for (const capability of capabilities) {
            const dataServiceCapability = {
              id: uuidv4() as ServiceCapabilityId,
              user_service_id: insertedUserService.id,
              service_capability_name: capability,
            };

            await db<ServiceCapability>(context, 'Service_Capability')
              .insert(dataServiceCapability)
              .returning('*');
          }
        }

        for (const serviceLink of input.requested_services) {
          const dataServiceLink = {
            id: uuidv4() as ServiceLinkId,
            service_id: addedService.id as ServiceId,
            name: serviceLink,
          };
          // TODO Call AWX to add service to community
          addServiceLink(context, dataServiceLink);
        }

        return addedService;
      } catch (error) {
        await trx.rollback();
        console.log('Error while adding the new community.', error);
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
