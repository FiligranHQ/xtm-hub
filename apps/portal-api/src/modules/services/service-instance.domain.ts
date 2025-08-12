import config from 'config';
import { toGlobalId } from 'graphql-relay/node/node.js';
import { v4 as uuidv4 } from 'uuid';
import { db, dbRaw, dbUnsecure, paginate } from '../../../knexfile';
import {
  ServiceCapability,
  ServiceConnection,
  ServiceDefinition,
  ServiceInstance,
  ServiceLink,
} from '../../__generated__/resolvers-types';
import { ServiceInstanceMutator } from '../../model/kanel/public/ServiceInstance';
import Subscription, {
  SubscriptionMutator,
} from '../../model/kanel/public/Subscription';
import { UserMutator } from '../../model/kanel/public/User';
import UserService, {
  UserServiceId,
} from '../../model/kanel/public/UserService';
import { UserServiceCapabilityId } from '../../model/kanel/public/UserServiceCapability';
import { PortalContext } from '../../model/portal-context';
import { CAPABILITY_BYPASS } from '../../portal.const';
import { sendMail } from '../../server/mail-service';
import { formatRawObject } from '../../utils/queryRaw.util';
import { loadSubscriptionWithOrganizationAndCapabilitiesBy } from '../subcription/subscription.helper';
import { loadSubscriptionCapabilities } from '../user_service/service-capability/subscription-capability.domain';
import { loadCapabilities } from '../user_service/user-service-capability/user-service-capability.helper';
import { insertUserService } from '../user_service/user_service.domain';
import { loadUserBy } from '../users/users.domain';
import { insertServiceCapability } from './instances/service-capabilities/service_capabilities.helper';

export const loadSubscribedServiceInstancesByIdentifier = async (
  context: PortalContext,
  identifier: string
) => {
  const subServiceInstance = await db<UserService>(context, 'ServiceInstance')
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
    .where('User_Organization.user_id', context.user.id)
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

  return subServiceInstance.map((sub) => {
    return {
      ...sub,
      organization_id: toGlobalId('Organization', sub.organization_id),
      service_instance_id: toGlobalId(
        'ServiceInstance',
        sub.service_instance_id
      ),
      configurations: sub.configurations.filter((config) => !!config),
    };
  });
};

export const loadPublicServiceInstances = (context: PortalContext, opts) => {
  const { first, after, orderMode, orderBy } = opts;
  const organizationId = context.user.selected_organization_id;
  const userId = context.user.id;

  const publicServiceQuery = db<ServiceInstance>(context, 'ServiceInstance')
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
    context,
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

export const getIsSubscribed = async (context, id) => {
  const organizationId = context.user.selected_organization_id;
  const { organization_subscribed } = await db<{
    organization_subscribed: boolean;
  }>(context, 'ServiceInstance')
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
  return organization_subscribed;
};

export const getServiceDefinitionCapabilities = (context, id) => {
  return db<ServiceCapability>(context, 'Service_Capability')
    .leftJoin(
      'ServiceDefinition',
      'ServiceDefinition.id',
      '=',
      'Service_Capability.service_definition_id'
    )
    .where('ServiceDefinition.id', '=', id)
    .select('Service_Capability.*');
};
export const loadServiceInstances = async (context: PortalContext, opts) =>
  paginate<ServiceInstance, ServiceConnection>(
    context,
    'ServiceInstance',
    opts
  );

export const getUserJoined = async (context, id) => {
  const result = await db<{ user_joined: boolean }>(context, 'ServiceInstance')
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
        context.user.id
      );
    })
    .select(dbRaw(`"User_Service".id IS NOT NULL AS user_joined`))
    .where(
      'Subscription.organization_id',
      '=',
      context.user.selected_organization_id
    )
    .first();

  return result?.user_joined === true;
};

export const loadServiceInstanceByIdWithCapabilities = async (
  context: PortalContext,
  service_instance_id: string
): Promise<ServiceInstance> => {
  const serviceInstanceQuery = await db<ServiceInstance>(
    context,
    'ServiceInstance'
  )
    .leftJoin(
      'Subscription',
      'ServiceInstance.id',
      'Subscription.service_instance_id'
    )
    .leftJoin('User_Service', function () {
      this.on('Subscription.id', 'User_Service.subscription_id').andOn(
        dbRaw(`"User_Service"."user_id" = '${context.user.id}'`)
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
      'ServiceInstance.id': service_instance_id,
    })
    .groupBy(['ServiceInstance.id', 'Subscription.id', 'service_def.id'])
    .first();

  const capabilities = await loadCapabilities(
    context,
    service_instance_id,
    context.user.id,
    context.user.selected_organization_id
  );
  return { ...serviceInstanceQuery, capabilities };
};

export const loadServiceInstanceBy = async (
  context: PortalContext,
  field: string,
  value: string
) => {
  return db<ServiceInstance>(context, 'ServiceInstance')
    .where({ [field]: value })
    .select('ServiceInstance.*')
    .first();
};

export const loadUnsecureServiceInstanceBy = async (
  field: ServiceInstanceMutator
) => {
  return dbUnsecure<ServiceInstance>('ServiceInstance').where(field);
};

export const loadServiceWithSubscriptions = async (
  context: PortalContext,
  service_instance_id
) => {
  const queryUserServiceCapabilities = db(context, 'UserService_Capability')
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

  const queryUserServiceWithCapa = db<UserService>(context, 'User_Service')
    .select(
      'User_Service.*',
      dbRaw(
        `COALESCE("userServiceCapabilities".capabilities, '[]'::json) as user_service_capability`
      )
    )
    .leftJoin(
      queryUserServiceCapabilities,
      'User_Service.id',
      '=',
      'userServiceCapabilities.user_service_id'
    );

  const querySubscriptions = db<Subscription>(context, 'Subscription')
    .where('Subscription.service_instance_id', '=', service_instance_id)
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
    .orderByRaw(
      `CASE WHEN org.id = '${context.user.selected_organization_id}' THEN 0 ELSE 1 END, "Subscription".id`
    );

  const [serviceInstance] = await db<ServiceInstance>(
    context,
    'ServiceInstance'
  )
    .where('ServiceInstance.id', '=', service_instance_id)
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

  if (!context.user.capabilities.some((c) => c.id === CAPABILITY_BYPASS.id)) {
    querySubscriptions.where(
      'Subscription.organization_id',
      '=',
      context.user.selected_organization_id
    );
  }

  const arraySubcriptions = await querySubscriptions;

  const subscriptions = arraySubcriptions.map((subscription) => ({
    ...subscription,
    subscription_capability: loadSubscriptionCapabilities(
      context,
      subscription.id
    ),
  }));

  return { ...serviceInstance, subscriptions };
};

export const grantServiceAccess = async (
  context: PortalContext,
  capabilitiesIds: string[],
  usersId: string[],
  subscriptionId: string
) => {
  const dataUserServices = usersId.map((userId) => ({
    id: uuidv4() as UserServiceId,
    user_id: userId,
    subscription_id: subscriptionId,
  }));
  const insertedUserServices = (await insertUserService(
    context,
    dataUserServices
  )) as [UserService];

  const [subscription] =
    await loadSubscriptionWithOrganizationAndCapabilitiesBy(context, {
      'Subscription.id': subscriptionId,
    } as SubscriptionMutator);
  for (const userId of usersId) {
    const user = await loadUserBy({ 'User.id': userId } as UserMutator);

    const serviceInstance = await loadServiceInstanceBy(
      context,
      'ServiceInstance.id',
      subscription.service_instance_id
    );

    const service_definition = await getServiceDefinition(
      context,
      serviceInstance.id
    );

    await sendMail({
      to: user.email,
      template: service_definition.identifier,
      params: {
        name: user.email,
        serviceLink: `${config.get('base_url_front')}/service/${service_definition.identifier}/${toGlobalId('ServiceInstance', serviceInstance.id)}`,
        serviceName: serviceInstance.name,
      },
    });
  }

  for (const capabilityId of capabilitiesIds) {
    const dataServiceCapabilities = insertedUserServices.map(
      (insertedUserService) => ({
        id: uuidv4() as UserServiceCapabilityId,
        user_service_id: insertedUserService.id,
        generic_service_capability_id: capabilityId,
      })
    );
    await insertServiceCapability(context, dataServiceCapabilities);
  }
  return insertedUserServices;
};

export const getLinks = (context, id) =>
  db<ServiceLink>(context, 'ServiceInstance')
    .where('ServiceInstance.id', '=', id)
    .leftJoin(
      'Service_Link as serviceLinks',
      'serviceLinks.service_instance_id',
      '=',
      'ServiceInstance.id'
    )
    .select('serviceLinks.*')
    .returning('*');

export const getServiceDefinition = (context, id) =>
  db<ServiceDefinition>(context, 'ServiceInstance')
    .where('ServiceInstance.id', '=', id)
    .leftJoin(
      'ServiceDefinition as service_def',
      'service_def.id',
      '=',
      'ServiceInstance.service_definition_id'
    )
    .select('service_def.*')
    .first();

export const loadSeoServiceInstances = (context: PortalContext) => {
  return db<ServiceInstance>(context, 'ServiceInstance')
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

export const loadSeoServiceInstanceBySlug = (
  context: PortalContext,
  slug: string
) => {
  return db<ServiceInstance>(context, 'ServiceInstance')
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

export const getServiceInstance = async (context, id) => {
  return await db<ServiceInstance>(context, 'ServiceInstance')
    .where('ServiceInstance.id', '=', id)
    .first();
};
