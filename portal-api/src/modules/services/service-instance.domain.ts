import config from 'config';
import { toGlobalId } from 'graphql-relay/node/node.js';
import { v4 as uuidv4 } from 'uuid';
import { db, dbRaw, dbUnsecure, paginate } from '../../../knexfile';
import {
  ServiceConnection,
  ServiceDefinitionIdentifier,
  ServiceInstance,
} from '../../__generated__/resolvers-types';
import { OrganizationId } from '../../model/kanel/public/Organization';
import { ServiceInstanceMutator } from '../../model/kanel/public/ServiceInstance';
import Subscription, {
  SubscriptionMutator,
} from '../../model/kanel/public/Subscription';
import User, { UserMutator } from '../../model/kanel/public/User';
import UserService, {
  UserServiceId,
} from '../../model/kanel/public/UserService';
import { UserServiceCapabilityId } from '../../model/kanel/public/UserServiceCapability';
import { PortalContext } from '../../model/portal-context';
import { CAPABILITY_BYPASS, ROLE_ADMIN_ORGA } from '../../portal.const';
import { sendMail } from '../../server/mail-service';
import { formatRawObject } from '../../utils/queryRaw.util';
import { loadSubscriptionBy } from '../subcription/subscription.helper';
import { GenericServiceCapabilityIds } from '../user_service/service-capability/generic_service_capability.const';
import { loadSubscriptionCapabilities } from '../user_service/service-capability/subscription-capability.domain';
import { insertUserService } from '../user_service/user_service.domain';
import { loadUserBy, loadUsersByOrganization } from '../users/users.domain';
import { insertServiceCapability } from './instances/service-capabilities/service_capabilities.helper';

export const loadPublicServiceInstances = async (
  context: PortalContext,
  opts
) => {
  const { first, after, orderMode, orderBy } = opts;
  const organizationId = context.user.selected_organization_id;
  const userId = context.user.id;

  const servicesConnection = await paginate<ServiceInstance>(
    context,
    'ServiceInstance',
    {
      first,
      after,
      orderMode,
      orderBy,
    }
  )
    .leftJoin('Subscription as subscription', function () {
      this.on('subscription.service_instance_id', '=', 'ServiceInstance.id')

        .andOnVal('subscription.organization_id', '=', organizationId);
    })
    .leftJoin(
      'ServiceDefinition as service_def',
      'service_def.id',
      '=',
      'ServiceInstance.service_definition_id'
    )
    .leftJoin('User_Service as userService', function () {
      this.on('userService.subscription_id', '=', 'subscription.id').andOnVal(
        'userService.user_id',
        '=',
        userId
      );
    })
    .leftJoin(
      'UserService_Capability as userServiceCapa',
      'userServiceCapa.user_service_id',
      '=',
      'userService.id'
    )
    .leftJoin(
      'Generic_Service_Capability as genericServiceCapability',
      'genericServiceCapability.id',
      '=',
      'userServiceCapa.generic_service_capability_id'
    )
    .leftJoin(
      'Subscription_Capability as subscriptionCapability',
      'subscriptionCapability.id',
      '=',
      'userServiceCapa.subscription_capability_id'
    )
    .leftJoin(
      'Service_Capability as serviceCapability',
      'serviceCapability.id',
      '=',
      'subscriptionCapability.service_capability_id'
    )
    .leftJoin(
      'Service_Link as serviceLinks',
      'serviceLinks.service_instance_id',
      '=',
      'ServiceInstance.id'
    )
    .select([
      'ServiceInstance.*',
      dbRaw(`"subscription"."id" IS NOT NULL AS organization_subscribed`),
      dbRaw(`"userService"."id" IS NOT NULL AS user_joined`),
      dbRaw(`COALESCE(
        json_agg(DISTINCT COALESCE("genericServiceCapability"."name", "serviceCapability"."name"))
        FILTER (WHERE "genericServiceCapability"."name" IS NOT NULL OR "serviceCapability"."name" IS NOT NULL),
        '[]'::json
      ) AS capabilities`),
      dbRaw('COALESCE(json_agg("serviceLinks"), \'[]\'::json) AS links'),
      dbRaw(
        formatRawObject({
          columnName: 'service_def',
          typename: 'ServiceDefinition',
          as: 'service_definition',
        })
      ),
    ])
    .where('ServiceInstance.public', '=', true)
    .andWhereRaw(`("subscription"."id" IS NULL OR "userService"."id" IS NULL)`)
    .groupBy([
      'ServiceInstance.id',
      'subscription.id',
      'userService.id',
      'service_def.id',
    ])
    .asConnection<ServiceConnection>();

  const { totalCount } = await db<ServiceInstance>(
    context,
    'ServiceInstance',
    opts
  )
    .leftJoin('Subscription as subscription', function () {
      this.on(
        'subscription.service_instance_id',
        '=',
        'ServiceInstance.id'
      ).andOnVal('subscription.organization_id', '=', organizationId);
    })
    .whereRaw(`"subscription"."id" IS NULL`)
    .countDistinct('ServiceInstance.id as totalCount')
    .first();

  return {
    totalCount,
    ...servicesConnection,
  };
};

export const loadServiceInstances = async (context: PortalContext, opts) => {
  const { first, after, orderMode, orderBy } = opts;
  const query = paginate<ServiceInstance>(context, 'ServiceInstance', {
    first,
    after,
    orderMode,
    orderBy,
  });
  const organizationId = context.user.selected_organization_id;
  const userId = context.user.id;
  const servicesConnection = await query
    .leftJoin(
      'ServiceDefinition as service_def',
      'service_def.id',
      '=',
      'ServiceInstance.service_definition_id'
    )
    .leftJoin('Subscription as subscription', function () {
      this.on(
        'subscription.service_instance_id',
        '=',
        'ServiceInstance.id'
      ).andOnVal('subscription.organization_id', '=', organizationId);
    })
    .leftJoin('User_Service as userService', function () {
      this.on('userService.subscription_id', '=', 'subscription.id').andOnVal(
        'userService.user_id',
        '=',
        userId
      );
    })
    .leftJoin(
      'UserService_Capability as userServiceCapa',
      'userServiceCapa.user_service_id',
      '=',
      'userService.id'
    )
    .leftJoin(
      'Generic_Service_Capability as genericServiceCapability',
      'genericServiceCapability.id',
      '=',
      'userServiceCapa.generic_service_capability_id'
    )
    .leftJoin(
      'Service_Link as serviceLinks',
      'serviceLinks.service_instance_id',
      '=',
      'ServiceInstance.id'
    )
    .select([
      'ServiceInstance.*',
      dbRaw(
        formatRawObject({
          columnName: 'service_def',
          typename: 'ServiceDefinition',
          as: 'service_definition',
        })
      ),
      dbRaw(`
        CASE
          WHEN "subscription"."id" IS NOT NULL THEN true
          ELSE false
        END AS subscribed
        `),
      dbRaw(`
      COALESCE(json_agg("genericServiceCapability"."name") FILTER (WHERE "genericServiceCapability"."name" IS NOT NULL), '[]'::json) AS capabilities
    `),
      dbRaw('COALESCE(json_agg("serviceLinks"), \'[]\'::json) AS links'),
    ])
    .groupBy(['ServiceInstance.id', 'subscription.id', 'service_def.id'])
    .asConnection<ServiceConnection>();

  const { totalCount } = await db<ServiceInstance>(
    context,
    'ServiceInstance',
    opts
  )
    .leftJoin('Subscription as subscription', function () {
      this.on(
        'subscription.service_instance_id',
        '=',
        'ServiceInstance.id'
      ).andOnVal('subscription.organization_id', '=', organizationId);
    })
    .countDistinct('ServiceInstance.id as totalCount')
    .first();

  return {
    totalCount,
    ...servicesConnection,
  };
};
export const loadServiceInstanceByIdWithCapabilities = async (
  context: PortalContext,
  service_instance_id: string
): Promise<ServiceInstance> => {
  return db<ServiceInstance>(context, 'ServiceInstance')
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
      'UserService_Capability',
      'User_Service.id',
      '=',
      'UserService_Capability.user_service_id'
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
    .leftJoin(
      'Generic_Service_Capability',
      'UserService_Capability.generic_service_capability_id',
      '=',
      'Generic_Service_Capability.id'
    )
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
      ),
      dbRaw(
        `json_agg(
    CASE
      WHEN "Generic_Service_Capability".id IS NOT NULL THEN
        "Generic_Service_Capability".name
      WHEN "Service_Capability".id IS NOT NULL THEN
        "Service_Capability".name
      ELSE NULL
    END
  ) AS capabilities`
      )
    )

    .where({
      'ServiceInstance.id': service_instance_id,
    })
    .groupBy(['ServiceInstance.id', 'Subscription.id', 'service_def.id'])
    .first();
};

export const loadServiceInstanceBy = async (
  context: PortalContext,
  field: string,
  value: string
): Promise<ServiceInstance> => {
  return db<ServiceInstance>(context, 'ServiceInstance')
    .leftJoin(
      'ServiceDefinition',
      'ServiceInstance.service_definition_id',
      '=',
      'ServiceDefinition.id'
    )
    .where({ [field]: value })
    .select(
      'ServiceInstance.*',
      dbRaw(
        formatRawObject({
          columnName: 'ServiceDefinition',
          typename: 'ServiceDefinition',
          as: 'service_definition',
        })
      )
    )
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

export const grantServiceAccessUsers = async (
  context: PortalContext,
  organizationId: OrganizationId,
  adminId: string,
  subscriptionId: string
): Promise<UserService[]> => {
  const adminsOrga = (await loadUsersByOrganization(
    organizationId,
    adminId,
    ROLE_ADMIN_ORGA.id
  )) as User[];

  return adminsOrga.length > 0
    ? await grantServiceAccess(
        context,
        [
          GenericServiceCapabilityIds.AccessId,
          GenericServiceCapabilityIds.ManageAccessId,
        ],
        adminsOrga.map(({ id }) => id),
        subscriptionId
      )
    : [];
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

  const [subscription] = await loadSubscriptionBy({
    'Subscription.id': subscriptionId,
  } as SubscriptionMutator);
  for (const userId of usersId) {
    const user = await loadUserBy({ 'User.id': userId } as UserMutator);

    const serviceInstance = await loadServiceInstanceBy(
      context,
      'ServiceInstance.id',
      subscription.service_instance_id
    );

    if (
      serviceInstance.service_definition.identifier ===
      ServiceDefinitionIdentifier.Vault
    ) {
      await sendMail({
        to: user.email,
        template: 'partnerVault',
        params: {
          name: user.email,
          partnerVaultLink: `${config.get('base_url_front')}/service/${serviceInstance.service_definition.identifier}/${toGlobalId('ServiceInstance', serviceInstance.id)}`,
          partnerVault: serviceInstance.name,
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
    await insertServiceCapability(context, dataServiceCapabilities);
  }
  return insertedUserServices;
};
