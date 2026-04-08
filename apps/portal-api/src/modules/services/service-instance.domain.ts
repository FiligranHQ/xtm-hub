import { v4 as uuidv4 } from 'uuid';
import { db, dbRaw, paginate } from '../../../knexfile';
import {
  SeoServiceInstance,
  ServiceConnection,
  ServiceDefinition,
  ServiceDefinitionIdentifier,
  ServiceInstanceTag,
  ServiceLink,
} from '../../__generated__/resolvers-types';
import { requestContext } from '../../context/request.context';
import { OrganizationId } from '../../model/kanel/public/Organization';
import ServiceConfiguration from '../../model/kanel/public/ServiceConfiguration';
import ServiceInstance, {
  ServiceInstanceId,
  ServiceInstanceInitializer,
  ServiceInstanceMutator,
} from '../../model/kanel/public/ServiceInstance';
import Subscription, {
  SubscriptionId,
  SubscriptionMutator,
} from '../../model/kanel/public/Subscription';
import { UserId, UserMutator } from '../../model/kanel/public/User';
import UserService, {
  UserServiceId,
} from '../../model/kanel/public/UserService';
import { UserServiceCapabilityId } from '../../model/kanel/public/UserServiceCapability';
import { isUserAdminPlatform } from '../../security/access';
import { restrictSubscriptionToUserOrganization } from '../../security/restriction/user-service';
import { buildServiceLink, sendMail } from '../../server/mail-service';
import { ServiceIdentifierToMailTemplate } from '../../server/mail-template/mail';
import { formatRawObject } from '../../utils/queryRaw.util';
import { PlatformConfiguration } from '../registration/registration.domain';
import { loadSubscriptionWithOrganizationAndCapabilitiesBy } from '../subcription/subscription.helper';
import { loadSubscriptionCapabilities } from '../user_service/service-capability/subscription-capability.domain';
import { UserServiceDomain } from '../user_service/user_service.domain';
import { loadUserBy } from '../users/users.domain';
import { insertServiceCapability } from './instances/service-capabilities/service_capabilities.helper';

export const ServiceInstanceDomain = {
  loadServiceInstancesByServiceDefinitionAndTagsWithoutSubscription: async (
    serviceDefinitionIdentifier: ServiceDefinitionIdentifier,
    tags: ServiceInstanceTag[]
  ): Promise<SeoServiceInstance[]> => {
    return db<ServiceInstance>('ServiceInstance')
      .leftJoin(
        'ServiceDefinition',
        'ServiceDefinition.id',
        '=',
        'ServiceInstance.service_definition_id'
      )
      .leftJoin(
        'Subscription',
        'Subscription.service_instance_id',
        '=',
        'ServiceInstance.id'
      )
      .leftJoin(
        'Service_Link',
        'Service_Link.service_instance_id',
        '=',
        'ServiceInstance.id'
      )
      .whereNull('Subscription.id')
      .andWhereRaw(
        `"ServiceInstance"."tags"::text[] @> ARRAY[${tags.map(() => '?').join(', ')}]::text[]`,
        tags
      )
      .andWhere(
        'ServiceDefinition.identifier',
        '=',
        serviceDefinitionIdentifier
      )
      .select(
        'ServiceInstance.id',
        'ServiceInstance.name',
        'ServiceInstance.slug',
        'ServiceInstance.description',
        'ServiceInstance.logo_document_id',
        'ServiceInstance.illustration_document_id',
        'ServiceInstance.tags',
        'ServiceInstance.ordering',
        dbRaw(
          formatRawObject({
            columnName: 'ServiceDefinition',
            typename: 'ServiceDefinition',
            as: 'service_definition',
          })
        ),
        dbRaw('json_agg("Service_Link") AS links')
      )
      .groupBy('ServiceInstance.id', 'ServiceDefinition.id');
  },
};

export const loadSubscribedServiceInstancesByIdentifier = async (
  user_id: UserId,
  identifier: string
) => {
  const subServiceInstance = await db<UserService>('ServiceInstance')
    .leftJoin(
      'ServiceDefinition',
      'ServiceDefinition.id',
      '=',
      'ServiceInstance.service_definition_id'
    )
    .leftJoin(
      'Subscription',
      'Subscription.service_instance_id',
      '=',
      'ServiceInstance.id'
    )
    .leftJoin(
      'Organization',
      'Organization.id',
      '=',
      'Subscription.organization_id'
    )
    .leftJoin(
      'User_Organization',
      'User_Organization.organization_id',
      '=',
      'Organization.id'
    )
    .leftJoin(
      'Subscription AS Organization_Subscriptions',
      'Organization_Subscriptions.organization_id',
      '=',
      'Organization.id'
    )
    .leftJoin(
      'Service_Configuration',
      'Service_Configuration.service_instance_id',
      '=',
      'Organization_Subscriptions.service_instance_id'
    )
    .where('User_Organization.user_id', user_id)
    .where('ServiceDefinition.identifier', identifier)
    .groupBy(['ServiceInstance.id', 'Organization.id'])
    .select([
      'ServiceInstance.id AS service_instance_id',
      'Organization.id AS organization_id',
      'Organization.personal_space AS is_personal_space',
      dbRaw(
        'COALESCE(json_agg("Service_Configuration"."config"), \'[]\'::json) AS configurations'
      ),
    ]);

  return subServiceInstance.map((sub) => ({
    ...sub,
    configurations: sub.configurations.filter((config) => !!config),
  }));
};

export const loadPublicServiceInstances = (
  userId: UserId,
  organizationId: OrganizationId,
  opts
) => {
  const { first, after, orderMode, orderBy } = opts;

  const publicServiceQuery = db<ServiceInstance>('ServiceInstance')
    .leftJoin('Subscription as subscription', function () {
      this.on('subscription.service_instance_id', '=', 'ServiceInstance.id')

        .andOnVal('subscription.organization_id', '=', organizationId);
    })
    .leftJoin('User_Service as userService', function () {
      this.on('userService.subscription_id', '=', 'subscription.id').andOnVal(
        'userService.user_id',
        '=',
        userId
      );
    })
    .select('ServiceInstance.*')
    .where('ServiceInstance.public', '=', true)
    .andWhereRaw(`("subscription"."id" IS NULL OR "userService"."id" IS NULL)`);

  return paginate<ServiceInstance, ServiceConnection>(
    'ServiceInstance',
    {
      first,
      after,
      orderMode,
      orderBy,
    },
    undefined,
    publicServiceQuery
  );
};

export const loadIsSubscribed = async (
  organizationId: OrganizationId,
  id: ServiceInstanceId
) => {
  const serviceInstance = await db<{
    organization_subscribed: boolean;
  }>('ServiceInstance')
    .where('ServiceInstance.id', '=', id)
    .leftJoin('Subscription as subscription', function () {
      this.on(
        'subscription.service_instance_id',
        '=',
        'ServiceInstance.id'
      ).andOnVal('subscription.organization_id', '=', organizationId);
    })
    .select(
      dbRaw(`
        CASE
          WHEN "subscription"."id" IS NOT NULL THEN true
          ELSE false
        END AS organization_subscribed
        `)
    )
    .first();
  return serviceInstance?.organization_subscribed ?? false;
};

export const loadServiceInstances = async (opts) => {
  const { filters, searchTerm, orderBy } = opts;
  return paginate<ServiceInstance, ServiceConnection>('ServiceInstance', {
    ...opts,
    orderBy: `ServiceInstance.${orderBy}`,
    filters,
    searchTerm,
  });
};

export const loadServiceInstanceSubscriptions = async (
  id: ServiceInstanceId
) => {
  return db<Subscription>('Subscription')
    .where('Subscription.service_instance_id', '=', id)
    .leftJoin('Organization', 'Organization.id', 'Subscription.organization_id')
    .select([
      'Subscription.*',
      dbRaw(
        formatRawObject({
          columnName: 'Organization',
          typename: 'Organization',
          as: 'organization',
        })
      ),
    ]);
};
export const loadSubscriptionByServiceInstanceAndOrganization = async (
  selectedOrganizationId: OrganizationId,
  id: ServiceInstanceId
) => {
  return db<Subscription>('Subscription')
    .where('Subscription.service_instance_id', '=', id)
    .where('Subscription.organization_id', '=', selectedOrganizationId)
    .leftJoin('Organization', 'Organization.id', 'Subscription.organization_id')

    .select([
      'Subscription.*',
      dbRaw(
        formatRawObject({
          columnName: 'Organization',
          typename: 'Organization',
          as: 'organization',
        })
      ),
    ])
    .first();
};

export const getUserJoined = async (
  userId: UserId,
  organizationId: OrganizationId,
  id: ServiceInstanceId
) => {
  const result = await db<{ user_joined: boolean }>('ServiceInstance')
    .where('ServiceInstance.id', '=', id)
    .leftJoin(
      'Subscription',
      'ServiceInstance.id',
      'Subscription.service_instance_id'
    )
    .leftJoin('User_Service', function () {
      this.on('Subscription.id', 'User_Service.subscription_id').andOnVal(
        'User_Service.user_id',
        '=',
        userId
      );
    })
    .select(dbRaw(`"User_Service".id IS NOT NULL AS user_joined`))
    .where('Subscription.organization_id', '=', organizationId)
    .first();

  return result?.user_joined === true;
};

export const loadServiceInstanceById = async (
  userId: UserId,
  serviceInstanceId: string
): Promise<ServiceInstance> => {
  return db<ServiceInstance>('ServiceInstance')
    .leftJoin(
      'Subscription',
      'ServiceInstance.id',
      'Subscription.service_instance_id'
    )
    .leftJoin('User_Service', function () {
      this.on('Subscription.id', 'User_Service.subscription_id').andOn(
        dbRaw('"User_Service"."user_id" = ?', [userId])
      );
    })

    .leftJoin(
      'ServiceDefinition as service_def',
      'service_def.id',
      '=',
      'ServiceInstance.service_definition_id'
    )
    .select(
      'ServiceInstance.*',
      'Subscription.id AS subscription_id',
      dbRaw(
        formatRawObject({
          columnName: 'service_def',
          typename: 'ServiceDefinition',
          as: 'service_definition',
        })
      )
    )
    .where({
      'ServiceInstance.id': serviceInstanceId,
    })
    .groupBy(['ServiceInstance.id', 'Subscription.id', 'service_def.id'])
    .first();
};

export const loadServiceInstanceBy = async (field: string, value: string) => {
  return db<ServiceInstance>('ServiceInstance')
    .where({ [field]: value })
    .select('ServiceInstance.*')
    .first();
};

export const loadServiceWithSubscriptions = async (
  serviceInstanceId: ServiceInstanceId,
  searchTerm?: string
) => {
  const { user } = requestContext.require();

  const queryUserServiceCapabilities = db('UserService_Capability')
    .leftJoin(
      'Generic_Service_Capability',
      'UserService_Capability.generic_service_capability_id',
      '=',
      'Generic_Service_Capability.id'
    )
    .leftJoin(
      'Subscription_Capability',
      'UserService_Capability.subscription_capability_id',
      '=',
      'Subscription_Capability.id'
    )
    .leftJoin(
      'Service_Capability',
      'Subscription_Capability.service_capability_id',
      '=',
      'Service_Capability.id'
    )
    .select(
      'UserService_Capability.user_service_id',
      dbRaw(
        `json_agg(
        CASE
        WHEN "Generic_Service_Capability".id IS NOT NULL THEN
        json_build_object(
          'id', "UserService_Capability".id,
          'user_service_id', "UserService_Capability".user_service_id,
          'generic_service_capability', json_build_object(
            'id', "Generic_Service_Capability".id,
            'name', "Generic_Service_Capability".name,
            '__typename', 'Generic_Service_Capability'
          ),
          '__typename', 'UserServiceCapability'
        )
        WHEN "Subscription_Capability".id IS NOT NULL THEN
        json_build_object(
          'id', "UserService_Capability".id,
          'user_service_id', "UserService_Capability".user_service_id,
          'subscription_capability', json_build_object(
            'id', "Subscription_Capability".id,
            'service_capability', json_build_object(
            'id', "Service_Capability".id,
            'name', "Service_Capability".name,
            '__typename', 'Service_Capability'
            ),
            '__typename', 'Subscription_Capability'
          ),
          '__typename', 'UserServiceCapability'
        )
        ELSE NULL
        END
      ) FILTER (WHERE "Generic_Service_Capability".id IS NOT NULL OR "Service_Capability".id IS NOT NULL) AS capabilities`
      )
    )
    .groupBy('UserService_Capability.user_service_id')
    .as('userServiceCapabilities');

  const queryUserServiceWithCapa = db<UserService>('User_Service')
    .select(
      'User_Service.*',
      dbRaw(
        `COALESCE("userServiceCapabilities".capabilities, '[]'::json) as user_service_capability`
      )
    )
    .tap(restrictSubscriptionToUserOrganization)
    .leftJoin(
      queryUserServiceCapabilities,
      'User_Service.id',
      '=',
      'userServiceCapabilities.user_service_id'
    );

  const querySubscriptions = db<Subscription>('Subscription')
    .where('Subscription.service_instance_id', '=', serviceInstanceId)
    .leftJoin(
      queryUserServiceWithCapa.as('userService'),
      'userService.subscription_id',
      '=',
      'Subscription.id'
    )
    .leftJoin('User as user', 'user.id', '=', 'userService.user_id')
    .leftJoin(
      'Organization as org',
      'org.id',
      '=',
      'Subscription.organization_id'
    )
    .modify((queryBuilder) => {
      if (searchTerm) {
        queryBuilder.where('org.name', 'ILIKE', `%${searchTerm}%`);
      }
    })
    .select(
      dbRaw('"Subscription".*'),
      dbRaw(
        formatRawObject({
          columnName: 'org',
          typename: 'Organization',
          as: 'organization',
        })
      ),
      dbRaw(
        `COALESCE(
          json_agg(
          CASE
          WHEN "userService".id IS NOT NULL THEN
            json_build_object(
              'id', "userService".id,
              'subscription_id', "userService".subscription_id,
              'user_id', "userService".user_id,
              'user_service_capability', COALESCE(
                  CASE
                    WHEN "userService".user_service_capability IS NOT NULL THEN "userService".user_service_capability
                    ELSE '[]'::json
                  END
                ),
              'user', CASE
                WHEN "user".id IS NOT NULL THEN json_build_object(
                  'id', "user".id,
                  'email', "user".email,
                  'first_name', "user".first_name,
                  'last_name', "user".last_name,
                  '__typename', 'User'
                )
                ELSE NULL
              END,
              '__typename', 'User_Service'
            )
            ELSE NULL
            END
          ) FILTER (WHERE "userService".id IS NOT NULL)::json,
          '[]'::json
        ) AS user_service`
      )
    )
    .groupBy(['Subscription.id', 'Subscription.organization_id', 'org.id'])
    .orderByRaw('CASE WHEN org.id = ? THEN 0 ELSE 1 END, "Subscription".id', [
      user.selected_organization_id,
    ]);

  const [serviceInstance] = await db<ServiceInstance>('ServiceInstance')
    .where('ServiceInstance.id', '=', serviceInstanceId)
    .leftJoin(
      'ServiceDefinition',
      'ServiceInstance.service_definition_id',
      '=',
      'ServiceDefinition.id'
    )
    .leftJoin(
      'Service_Capability',
      'ServiceDefinition.id',
      '=',
      'Service_Capability.service_definition_id'
    )
    .select([
      'ServiceInstance.*',
      dbRaw(
        `json_build_object('id', "ServiceDefinition".id, 'service_capability', COALESCE(json_agg(json_build_object('id', "Service_Capability".id, 'name', "Service_Capability".name, 'description', "Service_Capability".description, '__typename', 'Service_Capability')) FILTER (WHERE "Service_Capability".id IS NOT NULL), '[]'), '__typename', 'ServiceDefinition') as service_definition`
      ),
    ])
    .groupBy(['ServiceInstance.id', 'ServiceDefinition.id']);

  if (!isUserAdminPlatform(user)) {
    querySubscriptions.where(
      'Subscription.organization_id',
      '=',
      user.selected_organization_id
    );
  }

  const arraySubcriptions = await querySubscriptions;

  const subscriptions = arraySubcriptions.map((subscription) => ({
    ...subscription,
    subscription_capability: loadSubscriptionCapabilities(subscription.id),
  }));

  return { ...serviceInstance, subscriptions };
};

export const grantServiceAccess = async (
  capabilitiesIds: string[],
  usersId: UserId[],
  subscriptionId: SubscriptionId
) => {
  const dataUserServices = usersId.map((userId) => ({
    id: uuidv4() as UserServiceId,
    user_id: userId,
    subscription_id: subscriptionId,
  }));
  const insertedUserServices =
    await UserServiceDomain.insertUserService(dataUserServices);

  const [subscription] =
    await loadSubscriptionWithOrganizationAndCapabilitiesBy({
      'Subscription.id': subscriptionId,
    } as SubscriptionMutator);
  const serviceInstance = await loadServiceInstanceBy(
    'ServiceInstance.id',
    subscription.service_instance_id
  );

  const service_definition = await loadServiceDefinitionByServiceInstance(
    serviceInstance.id
  );

  for (const userId of usersId) {
    const user = await loadUserBy({ 'User.id': userId } as UserMutator);

    const mailTemplate = ServiceIdentifierToMailTemplate.get(
      service_definition.identifier
    );
    if (mailTemplate) {
      await sendMail({
        to: user.email,
        template: mailTemplate,
        params: {
          name: user.email,
          serviceLink: buildServiceLink({
            serviceDefinitionIdentifier: service_definition.identifier,
            serviceInstanceId: serviceInstance.id,
          }),
          serviceName: serviceInstance.name,
        },
      });
    }
  }

  for (const capabilityId of capabilitiesIds) {
    const dataServiceCapabilities = insertedUserServices.map(
      (insertedUserService) => ({
        id: uuidv4() as UserServiceCapabilityId,
        user_service_id: insertedUserService.id,
        generic_service_capability_id: capabilityId,
      })
    );
    await insertServiceCapability(dataServiceCapabilities);
  }
  return insertedUserServices;
};

export const loadLinks = (id) => {
  return db<ServiceLink[]>('Service_Link')
    .where('Service_Link.service_instance_id', '=', id)
    .select('*');
};

export const loadServiceDefinitionByServiceInstance = async (
  service_instance_id: string
): Promise<ServiceDefinition | undefined> => {
  return db<ServiceDefinition>('ServiceInstance')
    .where('ServiceInstance.id', '=', service_instance_id)
    .leftJoin(
      'ServiceDefinition as service_def',
      'service_def.id',
      '=',
      'ServiceInstance.service_definition_id'
    )
    .select('service_def.*')
    .first();
};

export const loadSeoServiceInstances = async (): Promise<
  SeoServiceInstance[]
> => {
  return db<ServiceInstance>('ServiceInstance')
    .leftJoin(
      'Service_Link',
      'Service_Link.service_instance_id',
      '=',
      'ServiceInstance.id'
    )
    .leftJoin(
      'ServiceDefinition',
      'ServiceDefinition.id',
      '=',
      'ServiceInstance.service_definition_id'
    )
    .select(
      'ServiceInstance.id',
      'ServiceInstance.name',
      'ServiceInstance.slug',
      'ServiceInstance.description',
      'ServiceInstance.logo_document_id',
      'ServiceInstance.illustration_document_id',
      'ServiceInstance.tags',
      'ServiceInstance.ordering',
      dbRaw(
        formatRawObject({
          columnName: 'ServiceDefinition',
          typename: 'ServiceDefinition',
          as: 'service_definition',
        })
      ),
      dbRaw('json_agg("Service_Link") AS links')
    )
    .where('ServiceInstance.public', '=', true)
    .groupBy('ServiceInstance.id', 'ServiceDefinition.id')
    .orderBy('ServiceInstance.ordering', 'asc');
};

export const loadSeoServiceInstanceBySlug = async (
  slug: string
): Promise<
  ServiceInstance & {
    service_definition: ServiceDefinition;
    links: ServiceLink[];
  }
> => {
  return db<ServiceInstance>('ServiceInstance')
    .leftJoin(
      'Service_Link',
      'Service_Link.service_instance_id',
      '=',
      'ServiceInstance.id'
    )
    .leftJoin(
      'ServiceDefinition',
      'ServiceDefinition.id',
      '=',
      'ServiceInstance.service_definition_id'
    )
    .select(
      'ServiceInstance.id',
      'ServiceInstance.name',
      'ServiceInstance.slug',
      'ServiceInstance.description',
      'ServiceInstance.logo_document_id',
      'ServiceInstance.illustration_document_id',
      'ServiceInstance.tags',
      dbRaw(
        formatRawObject({
          columnName: 'ServiceDefinition',
          typename: 'ServiceDefinition',
          as: 'service_definition',
        })
      ),
      dbRaw('json_agg("Service_Link") AS links')
    )
    .where('ServiceInstance.slug', '=', slug)
    .groupBy('ServiceInstance.id', 'ServiceDefinition.id')
    .first();
};

export const getServiceInstance = async (id: ServiceInstanceId) => {
  return db<ServiceInstance>('ServiceInstance')
    .where('ServiceInstance.id', '=', id)
    .first();
};

export const loadPlatformServiceInstance = async (
  organizationId: OrganizationId,
  serviceInstanceId: string
) => {
  return db<ServiceInstance>('ServiceInstance')
    .leftJoin(
      'Service_Configuration',
      'Service_Configuration.service_instance_id',
      '=',
      'ServiceInstance.id'
    )
    .leftJoin(
      'ServiceDefinition',
      'ServiceDefinition.id',
      '=',
      'ServiceInstance.service_definition_id'
    )
    .leftJoin(
      'Subscription',
      'Subscription.service_instance_id',
      '=',
      'ServiceInstance.id'
    )
    .where('ServiceInstance.id', '=', serviceInstanceId)
    .where('Subscription.organization_id', '=', organizationId)
    .whereIn('ServiceDefinition.identifier', [
      ServiceDefinitionIdentifier.OpenaevRegistration,
      ServiceDefinitionIdentifier.OpenctiRegistration,
    ])
    .select('ServiceInstance.*')
    .first();
};

export const insertServiceInstance = async (
  data: ServiceInstanceInitializer
) => {
  const [serviceInstance] = await db<ServiceInstance>('ServiceInstance')
    .insert(data)
    .returning('*');
  return serviceInstance;
};

export const updateServiceInstance = async (
  id: ServiceInstanceId,
  data: ServiceInstanceMutator
) => {
  const [result] = await db<ServiceInstance>('ServiceInstance')
    .where({ id })
    .update(data)
    .returning('*');

  return result;
};

export const loadPlatformConfigurationByServiceInstanceId = async (
  serviceInstanceId: string
): Promise<ServiceConfiguration | null> => {
  return db('Service_Configuration')
    .where('service_instance_id', '=', serviceInstanceId)
    .first()
    .select('*');
};

export const updatePlatformConfigurationByServiceInstanceId = async (
  serviceInstanceId: string,
  config: PlatformConfiguration
): Promise<ServiceConfiguration | null> => {
  const qb = db('Service_Configuration')
    .where('service_instance_id', '=', serviceInstanceId)
    .update({ config })
    .returning('*');

  const [result] = await qb;
  return result;
};

export const deleteServiceInstanceBy = async (
  filter: ServiceInstanceMutator
) => {
  const [deletedServiceInstance] = await db<ServiceInstance>('ServiceInstance')
    .where(filter)
    .delete('*');
  return deletedServiceInstance;
};
