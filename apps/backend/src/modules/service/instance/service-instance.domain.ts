import { v4 as uuidv4 } from 'uuid';
import { db, dbRaw, paginate } from '../../../../knexfile';
import {
  PlatformIdentifier,
  SeoServiceInstance,
  ServiceConnection,
  ServiceDefinition,
  ServiceDefinitionIdentifier,
  ServiceInstanceCreationStatus,
  ServiceInstanceTag,
  ServiceLink,
} from '../../../__generated__/resolvers-types';
import { requestContext } from '../../../context/request.context';
import { OrganizationId } from '../../../model/kanel/public/Organization';
import PlatformConfigurationModel, {
  PlatformConfigurationMutator,
} from '../../../model/kanel/public/PlatformConfiguration';
import ServiceInstance, {
  ServiceInstanceId,
  ServiceInstanceInitializer,
  ServiceInstanceMutator,
} from '../../../model/kanel/public/ServiceInstance';
import Subscription, {
  SubscriptionId,
  SubscriptionMutator,
} from '../../../model/kanel/public/Subscription';
import { UserId, UserMutator } from '../../../model/kanel/public/User';
import UserService, {
  UserServiceId,
} from '../../../model/kanel/public/UserService';
import { UserServiceCapabilityId } from '../../../model/kanel/public/UserServiceCapability';
import { isUserAdminPlatform } from '../../../security/access';
import { buildServiceLink, sendMail } from '../../../server/mail-service';
import { ServiceIdentifierToMailTemplate } from '../../../server/mail-template/mail';
import { formatRawObject } from '../../../utils/query-raw.util';
import { UserDomain } from '../../organization-management/user/user-domain/user.domain';
import {
  serviceInstanceNameMappedByPlatformIdentifier,
  serviceInstanceTagMappedByPlatformIdentifier,
} from '../../registration/registration.mapping';
import { insertServiceCapability } from '../../security-management/service-capability/service-capability.helper';
import { loadSubscriptionWithOrganizationAndCapabilitiesBy } from '../../subscription/subscription.helper';
import { UserServiceDomain } from '../../user-service/user-service.domain';

export const ServiceInstanceDomain = {
  createPlatformServiceInstance: async (
    serviceDefinitionId: string,
    platformIdentifier: PlatformIdentifier,
    creation_status: ServiceInstanceCreationStatus = ServiceInstanceCreationStatus.Ready
  ): Promise<ServiceInstanceId> => {
    const id = uuidv4() as ServiceInstanceId;
    await db('ServiceInstance').insert([
      {
        id,
        name: serviceInstanceNameMappedByPlatformIdentifier[platformIdentifier],
        description: '',
        creation_status,
        public: false,
        tags: [
          serviceInstanceTagMappedByPlatformIdentifier[platformIdentifier],
        ],
        service_definition_id: serviceDefinitionId,
      },
    ]);

    return id;
  },
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
      'PlatformConfiguration',
      'PlatformConfiguration.service_instance_id',
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
        `COALESCE(
          json_agg(
            jsonb_build_object(
              'registerer_id', "PlatformConfiguration"."registerer_id",
              'platform_id', "PlatformConfiguration"."platform_id",
              'tenant_id', "PlatformConfiguration"."tenant_id",
              'tenant_name', "PlatformConfiguration"."tenant_name",
              'platform_url', "PlatformConfiguration"."platform_url",
              'platform_title', "PlatformConfiguration"."platform_title",
              'platform_version', "PlatformConfiguration"."platform_version",
              'platform_contract', "PlatformConfiguration"."platform_contract",
              'token', "PlatformConfiguration"."token"
            )
          ) FILTER (WHERE "PlatformConfiguration"."service_instance_id" IS NOT NULL),
          '[]'::json
        ) AS configurations`
      ),
    ]);

  return subServiceInstance.map((sub) => ({
    ...sub,
    configurations: sub.configurations.filter((config) => !!config),
  }));
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
  const { user } = requestContext.require();

  const queryBuilder = db<Subscription>('Subscription')
    .where('Subscription.service_instance_id', '=', id)
    .leftJoin(
      'Organization',
      'Organization.id',
      'Subscription.organization_id'
    );

  if (!isUserAdminPlatform(user)) {
    queryBuilder.where(
      'Subscription.organization_id',
      '=',
      user.selected_organization_id
    );
  }

  return queryBuilder.select([
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

export const loadServiceInstanceBy = async (
  field: ServiceInstanceMutator,
  searchTerm?: string
) => {
  const query = db<ServiceInstance>('ServiceInstance')
    .where(field)
    .modify((queryBuilder) => {
      if (searchTerm) {
        queryBuilder.where('org.name', 'ILIKE', `%${searchTerm}%`);
      }
    });

  return query.select('ServiceInstance.*').first();
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
  const serviceInstance = await loadServiceInstanceBy({
    id: subscription.service_instance_id,
  });

  const service_definition = await loadServiceDefinitionByServiceInstance(
    serviceInstance.id
  );

  for (const userId of usersId) {
    const user = await UserDomain.loadUserBy({
      'User.id': userId,
    } as UserMutator);

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
      'PlatformConfiguration',
      'PlatformConfiguration.service_instance_id',
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
): Promise<PlatformConfigurationModel | null> => {
  return db('PlatformConfiguration')
    .where('service_instance_id', '=', serviceInstanceId)
    .first()
    .select('*');
};

export const updatePlatformConfigurationByServiceInstanceId = async (
  serviceInstanceId: string,
  config: PlatformConfigurationMutator
): Promise<PlatformConfigurationModel | null> => {
  const qb = db('PlatformConfiguration')
    .where('service_instance_id', '=', serviceInstanceId)
    .update({ ...config })
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
