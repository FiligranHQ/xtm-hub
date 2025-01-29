import { fromGlobalId } from 'graphql-relay/node/node.js';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseType, db, dbTx } from '../../../knexfile';
import {
  Resolvers,
  ServiceInstance,
  ServiceLink,
  Subscription,
} from '../../__generated__/resolvers-types';
import { ServiceDefinitionId } from '../../model/kanel/public/ServiceDefinition';
import { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import { ServiceLinkId } from '../../model/kanel/public/ServiceLink';
import ServicePrice, {
  ServicePriceId,
} from '../../model/kanel/public/ServicePrice';
import { SubscriptionId } from '../../model/kanel/public/Subscription';
import { dispatch, listen } from '../../pub';
import { logApp } from '../../utils/app-logger.util';
import { extractId } from '../../utils/utils';
import { loadOrganizationBy } from '../organizations/organizations.helper';
import {
  loadPublicServiceInstances,
  loadServiceInstanceByIdWithCapabilities,
  loadServiceInstances,
  loadServiceWithSubscriptions,
} from './service-instance.domain';

const resolvers: Resolvers = {
  Query: {
    serviceInstances: async (_, opt, context) => {
      return loadServiceInstances(context, opt);
    },
    publicServiceInstances: async (_, opt, context) => {
      return loadPublicServiceInstances(context, opt);
    },
    serviceInstanceById: async (_, { service_instance_id }, context) => {
      return await loadServiceInstanceByIdWithCapabilities(
        context,
        fromGlobalId(service_instance_id).id
      );
    },
    serviceInstanceByIdWithSubscriptions: async (
      _,
      { service_instance_id },
      context
    ) => {
      return loadServiceWithSubscriptions(
        context,
        extractId(service_instance_id)
      );
    },
  },
  Mutation: {
    deleteServiceInstance: async (_, { id }, context) => {
      const { id: databaseId } = fromGlobalId(id) as {
        type: DatabaseType;
        id: string;
      };
      const [deletedServiceInstance] = await db<ServiceInstance>(
        context,
        'ServiceInstance'
      )
        .where({ id: databaseId })
        .delete('*');
      await dispatch('ServiceInstance', 'delete', deletedServiceInstance);
      return deletedServiceInstance;
    },
    editServiceInstance: async (_, { id, name }, context) => {
      const { id: databaseId } = fromGlobalId(id) as {
        type: DatabaseType;
        id: string;
      };
      const [updatedServiceInstance] = await db<ServiceInstance>(
        context,
        'ServiceInstance'
      )
        .where({ id: databaseId })
        .update({ name })
        .returning('*');
      await dispatch('ServiceInstance', 'edit', updatedServiceInstance);
      return updatedServiceInstance;
    },
    addServiceInstance: async (_, { input }, context) => {
      const trx = await dbTx();

      try {
        const dataService = {
          id: uuidv4(),
          name: input.service_instance_name,
          description: input.service_instance_description,
          creation_status: 'PENDING',
        };
        const [addedServiceInstance] = await db<ServiceInstance>(
          context,
          'ServiceInstance'
        )
          .insert(dataService)
          .returning('*');

        const dataServicePrice = {
          id: uuidv4() as unknown as ServicePriceId,
          service_definition_id:
            addedServiceInstance.id as unknown as ServiceDefinitionId,
          fee_type: input.fee_type,
          start_date: new Date(),
          price: input.price,
        };

        await db<ServicePrice>(context, 'Service_Price')
          .insert(dataServicePrice)
          .returning('*');

        const dataServiceLink = {
          id: uuidv4() as unknown as ServiceLinkId,
          service_instance_id:
            addedServiceInstance.id as unknown as ServiceInstanceId,
          url: input.url,
          name: input.service_instance_name,
        };

        await db<ServiceLink>(context, 'Service_Link')
          .insert(dataServiceLink)
          .returning('*');
        await dispatch('ServiceInstance', 'add', addedServiceInstance);

        const dataSubscription = {
          id: uuidv4() as unknown as SubscriptionId,
          organization_id: fromGlobalId(input.organization_id).id,
          service_instance_id: addedServiceInstance.id,
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
        addedSubscription.service_instance = addedServiceInstance;
        await trx.commit();
        return addedSubscription;
      } catch (error) {
        await trx.rollback();
        logApp.error('Error while adding the new service.', error);
        throw error;
      }
    },
  },
  Subscription: {
    ServiceInstance: {
      subscribe: (_, __, context) => ({
        [Symbol.asyncIterator]: () => listen(context, ['ServiceInstance']),
      }),
    },
  },
};

export default resolvers;
