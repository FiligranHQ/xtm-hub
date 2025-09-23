import { fromGlobalId, toGlobalId } from 'graphql-relay/node/node.js';
import { v4 as uuidv4 } from 'uuid';
import { db, dbTx } from '../../../knexfile';
import { Resolvers, Subscription } from '../../__generated__/resolvers-types';

import config from 'config';
import { OrganizationId } from '../../model/kanel/public/Organization';
import { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import {
  SubscriptionId,
  SubscriptionMutator,
} from '../../model/kanel/public/Subscription';
import { UserId } from '../../model/kanel/public/User';
import { sendMail } from '../../server/mail-service';
import { ServiceIdentifierToMailTemplate } from '../../server/mail-template/mail';
import { logApp } from '../../utils/app-logger.util';
import { ErrorCode, UnknownErrorCode } from '../../utils/error/error.code';
import { mapToGraphQLError } from '../../utils/error/error.mapping';
import { extractId } from '../../utils/utils';
import { loadOrganizationBy } from '../organizations/organizations.domain';
import {
  loadServiceDefinitionByServiceInstance,
  loadServiceInstanceBy,
  loadServiceWithSubscriptions,
} from '../services/service-instance.domain';
import { telemetryApp } from '../telemetry/telemetry.app';
import {
  buildSubscribeEvent,
  shouldSendEventForService,
} from '../telemetry/telemetry.helper';
import { addCapabilitiesToSubscription } from '../user_service/service-capability/subscription-capability.domain';
import { addAdminAccess } from '../user_service/user_service.domain';
import {
  checkSubscriptionExists,
  fillSubscription,
  getServiceCapability,
  getSubscriptionCapability,
  getUserService,
} from './subscription.domain';
import { loadSubscriptionWithOrganizationAndCapabilitiesBy } from './subscription.helper';

const resolvers: Resolvers = {
  SubscriptionModel: {
    subscription_capability: ({ id }, _, context) =>
      getSubscriptionCapability(context, id),
    service_instance: ({ service_instance_id }, _, context) =>
      loadServiceInstanceBy(context, 'id', service_instance_id),
    user_service: ({ id }, _, context) => getUserService(context, id),
  },
  SubscriptionCapability: {
    service_capability: ({ id }, _, context) =>
      getServiceCapability(context, id),
  },
  Mutation: {
    addSubscription: async (_, { service_instance_id }, context) => {
      const trx = await dbTx();

      // Check the subscription does not already exist :
      try {
        const serviceInstanceId =
          extractId<ServiceInstanceId>(service_instance_id);
        const subscription = await checkSubscriptionExists(
          context,
          context.user.selected_organization_id,
          serviceInstanceId
        );

        if (subscription) {
          logApp.warn(
            'Forbidden access while adding subscription: you have already subscribed this service.'
          );

          throw new Error(ErrorCode.AlreadySubscribed);
        }

        const subscriptionData = {
          id: uuidv4(),
          service_instance_id: serviceInstanceId,
          organization_id: context.user.selected_organization_id,
          start_date: new Date(),
          end_date: undefined,
          billing: 100,
          status: 'ACCEPTED',
        };

        const [addedSubscription] = await db<Subscription>(
          context,
          'Subscription'
        )
          .insert(subscriptionData)
          .returning('*');

        const filledSubscription = await fillSubscription(
          context,
          addedSubscription
        );

        const selectedOrga = await loadOrganizationBy({
          id: context.user.selected_organization_id,
        });

        await addAdminAccess(
          context,
          context.user.id as UserId,
          filledSubscription.id as SubscriptionId,
          selectedOrga.personal_space
        );

        const serviceDefinition = await loadServiceDefinitionByServiceInstance(
          context,
          filledSubscription.service_instance_id
        );

        await sendMail({
          to: context.user.email,
          template: ServiceIdentifierToMailTemplate.get(
            serviceDefinition.identifier
          ),
          params: {
            name: context.user.email,
            serviceLink: `${config.get('base_url_front')}/service/${serviceDefinition.identifier}/${toGlobalId('ServiceInstance', filledSubscription.service_instance.id)}`,
            serviceName: filledSubscription.service_instance.name,
          },
        });

        // TODO If Service is AUTO_JOIN
        // await grantServiceAccessUsers(
        //   context,
        //   context.user.selected_organization_id as OrganizationId,
        //   context.user.id,
        //   filledSubscription.id
        // );

        await trx.commit();

        try {
          if (shouldSendEventForService(serviceDefinition.identifier)) {
            const subscribeEvent = buildSubscribeEvent(
              selectedOrga,
              context.user.id,
              serviceDefinition.identifier
            );
            telemetryApp.sendTelemetryEvent(subscribeEvent);
          }
        } catch (error) {
          logApp.error('Unable to send telemetry event for subscription', {
            error,
          });
        }

        return {
          ...filledSubscription.service_instance,
          subscribed: true,
          capabilities: ['ACCESS_SERVICE', 'MANAGE_ACCESS'],
        };
      } catch (error) {
        await trx.rollback();
        throw mapToGraphQLError(
          error,
          UnknownErrorCode.ServiceSubscriptionError
        );
      }
    },
    addSubscriptionInService: async (
      _,
      {
        service_instance_id,
        organization_id,
        capability_ids,
        start_date,
        end_date,
      },
      context
    ) => {
      const trx = await dbTx();

      // Check the subscription does not already exist :
      try {
        const subscription = await checkSubscriptionExists(
          context,
          (fromGlobalId(organization_id).id ??
            context.user.selected_organization_id) as OrganizationId,
          fromGlobalId(service_instance_id).id as ServiceInstanceId
        );
        if (subscription) {
          logApp.warn(
            "Forbidden access while adding subscription: You've already subscribed this organization to this service."
          );
          throw new Error(ErrorCode.AlreadySubscribedOrganizationError);
        }

        const subscriptionData = {
          id: uuidv4(),
          service_instance_id: fromGlobalId(service_instance_id).id,
          organization_id:
            fromGlobalId(organization_id).id ??
            context.user.selected_organization_id,
          start_date: start_date,
          end_date: end_date,
          billing: 0,
          status: 'ACCEPTED',
        };

        const [addedSubscription] = await db<Subscription>(
          context,
          'Subscription'
        )
          .insert(subscriptionData)
          .returning('*');

        await addCapabilitiesToSubscription(
          context,
          capability_ids,
          addedSubscription.id as SubscriptionId
        );

        await trx.commit();
        return loadServiceWithSubscriptions(
          context,
          fromGlobalId(service_instance_id).id
        );
      } catch (error) {
        await trx.rollback();
        throw mapToGraphQLError(
          error,
          UnknownErrorCode.ServiceSubscriptionError
        );
      }
    },
    deleteSubscription: async (_, { subscription_id }, context) => {
      try {
        const [subscription] =
          await loadSubscriptionWithOrganizationAndCapabilitiesBy(context, {
            'Subscription.id': extractId<SubscriptionId>(subscription_id),
          } as SubscriptionMutator);

        // TODO: to be rethought when billing is used in XTM
        // if (subscription.billing !== 0) {
        //     logApp.warn(
        //       'Forbidden access while deleting subscription: you can not delete a subscription with billing.'
        //     );
        //   throw ForbiddenAccess('ERROR_SUBSCRIPTION_WITH_BILLING');
        // }

        await db<Subscription>(context, 'Subscription')
          .where({ id: fromGlobalId(subscription_id).id })
          .delete('*');

        return loadServiceWithSubscriptions(
          context,
          subscription.service_instance_id
        );
      } catch (error) {
        throw mapToGraphQLError(
          error,
          UnknownErrorCode.DeleteSubscriptionError
        );
      }
    },
  },
  Query: {
    subscriptionById: async (_, { subscription_id }, context) => {
      const subscriptions =
        await loadSubscriptionWithOrganizationAndCapabilitiesBy(context, {
          'Subscription.id': extractId<SubscriptionId>(subscription_id),
        } as SubscriptionMutator);

      return subscriptions[0];
    },
  },
};

export default resolvers;
