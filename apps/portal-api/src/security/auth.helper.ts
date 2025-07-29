import { fromGlobalId } from 'graphql-relay/node/node.js';
import { dbRaw, dbUnsecure } from '../../knexfile';
import { loadUnsecureSubscriptionBy } from '../modules/subcription/subscription.helper';
import { CAPABILITY_BYPASS } from '../portal.const';
import { ServiceCapabilityArgs } from './directive-auth';

import {
  OrganizationCapability,
  ServiceInstance,
} from '../__generated__/resolvers-types';
import CapabilityPortal from '../model/kanel/public/CapabilityPortal';
import { SubscriptionMutator } from '../model/kanel/public/Subscription';
import { PortalContext } from '../model/portal-context';
import { UserLoadUserBy } from '../model/user';
import { loadUserOrganizationCapabilities } from '../modules/common/user-organization-capability.domain';
import { extractId } from '../utils/utils';

export const loadCapabilitiesByServiceId = async (
  user: UserLoadUserBy,
  serviceId: string
): Promise<{ capabilities: string[] } | undefined> => {
  const userId = user.id;
  const organizationId = user.selected_organization_id;
  return dbUnsecure<ServiceInstance>('ServiceInstance')
    .leftJoin('Subscription as subscription', function () {
      this.on(
        'subscription.service_instance_id',
        '=',
        'ServiceInstance.id'
      ).andOn(
        'subscription.organization_id',
        '=',
        dbRaw('?', [organizationId])
      );
    })
    .leftJoin('User_Service as userService', function () {
      this.on('userService.subscription_id', '=', 'subscription.id').andOn(
        'userService.user_id',
        '=',
        dbRaw('?', [userId])
      );
    })
    .leftJoin(
      'UserService_Capability as userServiceCapa',
      'userServiceCapa.user_service_id',
      '=',
      'userService.id'
    )
    .leftJoin(
      'Subscription_Capability',
      'userServiceCapa.subscription_capability_id',
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
      'Generic_Service_Capability.id',
      '=',
      'userServiceCapa.generic_service_capability_id'
    )
    .select([
      dbRaw(
        `json_agg(
          CASE
            WHEN "Generic_Service_Capability".id IS NOT NULL THEN
              "Generic_Service_Capability".name
            WHEN "Service_Capability".id IS NOT NULL THEN
              "Service_Capability".name
            ELSE NULL
          END
        ) FILTER (WHERE "Generic_Service_Capability".id IS NOT NULL OR "Service_Capability".id IS NOT NULL) AS capabilities`
      ),
    ])
    .where('ServiceInstance.id', '=', dbRaw('?', [serviceId]))
    .groupBy(['ServiceInstance.id', 'subscription.id'])
    .first();
};

export const userHasBypassCapability = (user: UserLoadUserBy): boolean => {
  return (user.capabilities ?? []).some(
    (c) => c.name === CAPABILITY_BYPASS.name
  );
};

export const getCapabilityUser = (
  user: UserLoadUserBy,
  args: ServiceCapabilityArgs
) =>
  args.service_instance_id
    ? loadCapabilitiesByServiceId(
        user,
        fromGlobalId(args.service_instance_id).id
      )
    : loadUnsecureSubscriptionBy({
        id: extractId(args.subscription_id),
      } as SubscriptionMutator).then(([subscription]) =>
        loadCapabilitiesByServiceId(user, subscription.service_instance_id)
      );

export const isUserAllowed = ({
  userCapabilities,
  organizationCapabilities,
  requiredCapability,
}: {
  requiredCapability: OrganizationCapability;
  userCapabilities?: CapabilityPortal[];
  organizationCapabilities?: OrganizationCapability[];
}): boolean => {
  const hasBypassCapability = (userCapabilities ?? []).some(
    (c) => c.name === CAPABILITY_BYPASS.name
  );
  if (hasBypassCapability) {
    return true;
  }

  const possibleCapabilities: string[] = [
    requiredCapability,
    OrganizationCapability.AdministrateOrganization,
  ];

  return (organizationCapabilities ?? []).some((organizationCapability) =>
    possibleCapabilities.includes(organizationCapability)
  );
};

export const isUserAllowedOnOrganization = async (
  context: PortalContext,
  {
    organizationId,
    requiredCapability,
  }: {
    organizationId: string;
    requiredCapability: OrganizationCapability;
  }
): Promise<boolean> => {
  const organizationCapabilities = await loadUserOrganizationCapabilities(
    context,
    organizationId
  );

  return isUserAllowed({
    requiredCapability: requiredCapability,
    userCapabilities: context.user.capabilities,
    organizationCapabilities: organizationCapabilities.map(
      ({ name }) => name as OrganizationCapability
    ),
  });
};
