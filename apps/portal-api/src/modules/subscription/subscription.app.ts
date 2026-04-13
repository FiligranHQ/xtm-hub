import { v4 as uuidv4 } from 'uuid';
import {
  ServiceDefinitionIdentifier,
  ServiceInstance as ServiceInstanceGraphQl,
  SubscriptionModel,
} from '../../__generated__/resolvers-types';
import { requestContext } from '../../context/request.context';
import Organization, {
  OrganizationId,
} from '../../model/kanel/public/Organization';
import { ServiceCapabilityId } from '../../model/kanel/public/ServiceCapability';
import { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import Subscription, {
  SubscriptionId,
} from '../../model/kanel/public/Subscription';
import { UserId } from '../../model/kanel/public/User';
import { UserLoadUserBy } from '../../model/user';
import { buildServiceLink, sendMail } from '../../server/mail-service';
import { ServiceIdentifierToMailTemplate } from '../../server/mail-template/mail';
import { logApp } from '../../utils/app-logger.util';
import { ErrorCode } from '../../utils/error/error.code';
import { loadOrganizationBy } from '../organization-management/organizations/organizations.domain';
import { addCapabilitiesToSubscription } from '../security-management/service-capability/subscription-capability.domain';
import {
  loadServiceDefinitionByServiceInstance,
  loadServiceInstanceById,
} from '../service/instance/service-instance.domain';
import { SubscriptionStatus } from '../subscription.const';
import { telemetryApp } from '../telemetry/telemetry.app';
import {
  buildSubscribeEvent,
  shouldSendEventForService,
} from '../telemetry/telemetry.helper';
import { UserServiceDomain } from '../user-service/user-service.domain';
import {
  createSubscription,
  loadSubscriptionBy,
  SubscriptionDomain,
} from './subscription.domain';

export const subscriptionApp = {
  loadSubscriptionModel: async (
    user: UserLoadUserBy,
    service_instance_id: ServiceInstanceId
  ): Promise<SubscriptionModel> => {
    const subscription = await loadSubscriptionBy({
      service_instance_id,
      organization_id: user.selected_organization_id,
    });

    return subscription as unknown as SubscriptionModel;
  },

  subscribeSelectedOrganizationToService: async ({
    serviceInstanceId,
  }: {
    serviceInstanceId: ServiceInstanceId;
  }): Promise<ServiceInstanceGraphQl> => {
    const { user } = requestContext.require();
    await assertOrganizationIsNotAlreadySubscribed({
      serviceInstanceId,
      organizationId: user.selected_organization_id,
    });

    const selectedOrganization = await loadOrganizationBy({
      id: user.selected_organization_id,
    });

    await createSubscriptionWithAdminAccess({
      serviceInstanceId,
      organization: selectedOrganization,
    });

    const [serviceDefinition, serviceInstance] = await Promise.all([
      loadServiceDefinitionByServiceInstance(serviceInstanceId),
      loadServiceInstanceById(user.id, serviceInstanceId),
    ]);

    await sendMail({
      to: user.email,
      template: ServiceIdentifierToMailTemplate.get(
        serviceDefinition.identifier
      ),
      params: {
        name: user.email,
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

    await sendSubscriptionTelemetryEvent({
      selectedOrganization,
      serviceDefinitionIdentifier: serviceDefinition.identifier,
    });

    return {
      ...serviceInstance,
      tags: serviceInstance.tags,
      creation_status: serviceInstance.creation_status,
      join_type: serviceInstance.join_type,
      capabilities: ['ACCESS_SERVICE', 'MANAGE_ACCESS'],
    };
  },

  subscribeOrganizationToService: async ({
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
  }): Promise<Subscription> => {
    await assertOrganizationIsNotAlreadySubscribed({
      serviceInstanceId,
      organizationId,
    });

    const subscriptionData = {
      id: uuidv4() as SubscriptionId,
      service_instance_id: serviceInstanceId,
      organization_id: organizationId,
      start_date: startDate,
      end_date: endDate,
      billing: 0,
      status: SubscriptionStatus.ACCEPTED,
    };

    const createdSubscription = await createSubscription(subscriptionData);
    await addCapabilitiesToSubscription(createdSubscription.id, capabilityIds);
    return createdSubscription;
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

    return SubscriptionDomain.deleteSubscription(id);
  },
};

const assertOrganizationIsNotAlreadySubscribed = async ({
  serviceInstanceId,
  organizationId,
}: {
  serviceInstanceId: ServiceInstanceId;
  organizationId: OrganizationId;
}) => {
  const subscription = await loadSubscriptionBy({
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

const createSubscriptionWithAdminAccess = async ({
  serviceInstanceId,
  organization,
}: {
  serviceInstanceId: ServiceInstanceId;
  organization: Organization;
}): Promise<{ createdSubscription: Subscription }> => {
  const { user } = requestContext.require();
  const subscriptionInitializerData = {
    id: uuidv4() as SubscriptionId,
    service_instance_id: serviceInstanceId,
    organization_id: user.selected_organization_id,
    start_date: new Date(),
    end_date: undefined,
    billing: 100,
    status: SubscriptionStatus.ACCEPTED,
  };

  const createdSubscription = await createSubscription(
    subscriptionInitializerData
  );

  await UserServiceDomain.addAdminAccess(
    user.id as UserId,
    createdSubscription.id,
    organization.personal_space
  );

  return {
    createdSubscription,
  };
};

const sendSubscriptionTelemetryEvent = async ({
  selectedOrganization,
  serviceDefinitionIdentifier,
}: {
  selectedOrganization: Organization;
  serviceDefinitionIdentifier: ServiceDefinitionIdentifier;
}) => {
  const { user } = requestContext.require();
  try {
    if (shouldSendEventForService(serviceDefinitionIdentifier)) {
      const subscribeEvent = buildSubscribeEvent(
        selectedOrganization,
        user.id,
        serviceDefinitionIdentifier
      );
      await telemetryApp.sendTelemetryEvent(subscribeEvent);
    }
  } catch (error) {
    logApp.error('Unable to send telemetry event for subscription', {
      error,
    });
  }
};
