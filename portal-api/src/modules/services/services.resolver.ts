import { fromGlobalId, toGlobalId } from 'graphql-relay/node/node.js';
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
import { uploadNewFile } from './document/document.helper';
import {
  getCapabilities,
  getIsSubscribed,
  getLinks,
  getServiceDefinition,
  getServiceDefinitionCapabilities,
  getUserJoined,
  loadPublicServiceInstances,
  loadServiceInstanceBy,
  loadServiceInstances,
  loadServiceWithSubscriptions,
} from './service-instance.domain';

const resolvers: Resolvers = {
  ServiceInstance: {
    logo_document_id: ({ logo_document_id }) => {
      if (logo_document_id) {
        return toGlobalId('ServiceInstance', logo_document_id);
      }
    },
    illustration_document_id: ({ illustration_document_id }) => {
      if (illustration_document_id) {
        return toGlobalId('ServiceInstance', illustration_document_id);
      }
    },
    links: ({ id }, _, context) => getLinks(context, id),
    service_definition: ({ id }, _, context) =>
      getServiceDefinition(context, id),
    organization_subscribed: ({ id }, _, context) =>
      getIsSubscribed(context, id),
    capabilities: ({ id }, _, context) => getCapabilities(context, id),
    user_joined: ({ id }, _, context) => getUserJoined(context, id),
  },
  ServiceDefinition: {
    service_capability: ({ id }, _, context) =>
      getServiceDefinitionCapabilities(context, id),
  },
  Query: {
    serviceInstances: async (_, opt, context) => {
      return loadServiceInstances(context, opt);
    },
    publicServiceInstances: async (_, opt, context) => {
      return loadPublicServiceInstances(context, opt);
    },
    serviceInstanceById: async (_, { service_instance_id }, context) => {
      const serviceInstance = await loadServiceInstanceBy(
        context,
        'id',
        fromGlobalId(service_instance_id).id
      );

      // Not found
      if (!serviceInstance) {
        return null;
      }
      const userJoined = await getUserJoined(context, serviceInstance.id);
      // Found but the user has not joinded the service yet
      if (
        ['JOIN_AUTO', 'JOIN_SELF'].includes(serviceInstance.join_type) &&
        !userJoined
      ) {
        throw new Error('ERROR_SERVICE_INSTANCE_USER_MUST_JOIN_SERVICE');
      }

      return serviceInstance;
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
    addServicePicture: async (_, payload, context) => {
      const document = await uploadNewFile(
        context,
        payload.document,
        fromGlobalId(payload.serviceId).id as ServiceInstanceId
      );
      const update = payload.isLogo
        ? {
            logo_document_id: document.id,
          }
        : {
            illustration_document_id: document.id,
          };
      const [updatedServiceInstance] = await db<ServiceInstance>(
        context,
        'ServiceInstance'
      )
        .where({ id: fromGlobalId(payload.serviceId).id })
        .update(update)
        .returning('*');
      await dispatch('ServiceInstance', 'edit', updatedServiceInstance);
      return updatedServiceInstance;
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
