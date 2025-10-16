import { v4 as uuidv4 } from 'uuid';
import { dbTx } from '../../../knexfile';
import {
  ServiceDefinitionIdentifier,
  ServiceInstanceCreationStatus,
  ServiceInstance as ServiceInstanceGraphQl,
  ServiceInstanceJoinType,
  SubscriptionModel,
} from '../../__generated__/resolvers-types';
import Organization, {
  OrganizationId,
} from '../../model/kanel/public/Organization';
import { ServiceCapabilityId } from '../../model/kanel/public/ServiceCapability';
import { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import Subscription, {
  SubscriptionId,
} from '../../model/kanel/public/Subscription';
import { UserId } from '../../model/kanel/public/User';
import { PortalContext } from '../../model/portal-context';
import { buildServiceLink, sendMail } from '../../server/mail-service';
import { ServiceIdentifierToMailTemplate } from '../../server/mail-template/mail';
import { logApp } from '../../utils/app-logger.util';
import { ErrorCode } from '../../utils/error/error.code';
import { loadOrganizationBy } from '../organizations/organizations.domain';
import {
  loadServiceDefinitionByServiceInstance,
  loadServiceInstanceById,
} from '../services/service-instance.domain';
import { SubscriptionStatus } from '../subscription.const';
import { telemetryApp } from '../telemetry/telemetry.app';
import {
  buildSubscribeEvent,
  shouldSendEventForService,
} from '../telemetry/telemetry.helper';
import { addCapabilitiesToSubscription } from '../user_service/service-capability/subscription-capability.domain';
import { addAdminAccess } from '../user_service/user_service.domain';
import {
  createSubscription,
  loadSubscriptionBy,
  subscriptionDomain,
} from './subscription.domain';

export const subscriptionApp = {
  loadSubscriptionModel: async (
    context: PortalContext,
    service_instance_id: string
  ): Promise<SubscriptionModel> => {
    const subscription = await loadSubscriptionBy(context, {
      service_instance_id: service_instance_id as ServiceInstanceId,
      organization_id: context.user.selected_organization_id,
    });

    return subscription as unknown as SubscriptionModel;
  },

  subscribeSelectedOrganizationToService: async (
    context: PortalContext,
    { serviceInstanceId }: { serviceInstanceId: ServiceInstanceId }
  ): Promise<ServiceInstanceGraphQl> => {
    await assertOrganizationIsNotAlreadySubscribed(context, {
      serviceInstanceId,
      organizationId: context.user.selected_organization_id,
    });

    const trx = await dbTx();
    try {
      const selectedOrganization = await loadOrganizationBy({
        id: context.user.selected_organization_id,
      });

      await createSubscriptionWithAdminAccess(context, {
        serviceInstanceId,
        organization: selectedOrganization,
      });

      const [serviceDefinition, serviceInstance] = await Promise.all([
        loadServiceDefinitionByServiceInstance(context, serviceInstanceId),
        loadServiceInstanceById(context, serviceInstanceId),
      ]);

      await sendMail({
        to: context.user.email,
        template: ServiceIdentifierToMailTemplate.get(
          serviceDefinition.identifier
        ),
        params: {
          name: context.user.email,
          serviceLink: buildServiceLink({
            serviceDefinitionIdentifier: serviceDefinition.identifier,
            serviceInstanceId,
          }),
          serviceName: serviceInstance.name,
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

      sendSubscriptionTelemetryEvent(context, {
        selectedOrganization,
        serviceDefinitionIdentifier:
          serviceDefinition.identifier as ServiceDefinitionIdentifier,
      });

      return {
        ...serviceInstance,
        creation_status:
          serviceInstance.creation_status as ServiceInstanceCreationStatus,
        join_type: serviceInstance.join_type as ServiceInstanceJoinType,
        capabilities: ['ACCESS_SERVICE', 'MANAGE_ACCESS'],
      };
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  },

  subscribeOrganizationToService: async (
    context: PortalContext,
    {
      organizationId,
      serviceInstanceId,
      startDate,
      endDate,
      capabilityIds,
    }: {
      organizationId: OrganizationId;
      serviceInstanceId: ServiceInstanceId;
      startDate: Date;
      endDate: Date;
      capabilityIds: ServiceCapabilityId[];
    }
  ): Promise<void> => {
    await assertOrganizationIsNotAlreadySubscribed(context, {
      serviceInstanceId,
      organizationId,
    });

    const trx = await dbTx();
    try {
      const subscriptionData = {
        id: uuidv4() as SubscriptionId,
        service_instance_id: serviceInstanceId,
        organization_id: organizationId,
        start_date: startDate,
        end_date: endDate,
        billing: 0,
        status: SubscriptionStatus.ACCEPTED,
      };

      const createdSubscription = await createSubscription(
        context,
        subscriptionData
      );

      await addCapabilitiesToSubscription(
        context,
        createdSubscription.id,
        capabilityIds
      );

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  },

  deleteSubscription: async (id: SubscriptionId): Promise<Subscription> => {
    // TODO: to be rethought when billing is used in XTM
    // const [subscription] =
    //   await loadSubscriptionWithOrganizationAndCapabilitiesBy(portalContext, {
    //     'Subscription.id': id,
    //   } as SubscriptionMutator);
    // if (subscription.billing !== 0) {
    //     logApp.warn(
    //       'Forbidden access while deleting subscription: you can not delete a subscription with billing.'
    //     );
    //   throw ForbiddenAccess('ERROR_SUBSCRIPTION_WITH_BILLING');
    // }

    return subscriptionDomain.deleteSubscription(id);
  },
};

const assertOrganizationIsNotAlreadySubscribed = async (
  context: PortalContext,
  {
    serviceInstanceId,
    organizationId,
  }: { serviceInstanceId: ServiceInstanceId; organizationId: OrganizationId }
) => {
  const subscription = await loadSubscriptionBy(context, {
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

const createSubscriptionWithAdminAccess = async (
  context: PortalContext,
  {
    serviceInstanceId,
    organization,
  }: {
    serviceInstanceId: ServiceInstanceId;
    organization: Organization;
  }
): Promise<{ createdSubscription: Subscription }> => {
  const subscriptionInitializerData = {
    id: uuidv4() as SubscriptionId,
    service_instance_id: serviceInstanceId,
    organization_id: context.user.selected_organization_id,
    start_date: new Date(),
    end_date: undefined,
    billing: 100,
    status: SubscriptionStatus.ACCEPTED,
  };

  const createdSubscription = await createSubscription(
    context,
    subscriptionInitializerData
  );

  await addAdminAccess(
    context,
    context.user.id as UserId,
    createdSubscription.id,
    organization.personal_space
  );

  return {
    createdSubscription,
  };
};

const sendSubscriptionTelemetryEvent = (
  context: PortalContext,
  {
    selectedOrganization,
    serviceDefinitionIdentifier,
  }: {
    selectedOrganization: Organization;
    serviceDefinitionIdentifier: ServiceDefinitionIdentifier;
  }
) => {
  try {
    if (shouldSendEventForService(serviceDefinitionIdentifier)) {
      const subscribeEvent = buildSubscribeEvent(
        selectedOrganization,
        context.user.id,
        serviceDefinitionIdentifier
      );
      telemetryApp.sendTelemetryEvent(subscribeEvent);
    }
  } catch (error) {
    logApp.error('Unable to send telemetry event for subscription', {
      error,
    });
  }
};
