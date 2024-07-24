import {
  Resolvers,
  Service,
  ServiceLink,
  Subscription,
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
import { loadPublicServices } from './services.domain';

const resolvers: Resolvers = {
  Query: {
    services: async (_, opt, context) => {
      const shouldReturnPrivateServices = context.user.capabilities.some(
        (capability) => !capability.name.includes('BYPASS')
      );

      return loadPublicServices(context, opt, shouldReturnPrivateServices);
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
      console.log('input', input);
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
