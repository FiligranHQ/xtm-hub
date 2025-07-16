import { db, dbUnsecure } from '../../../../../knexfile';
import {
  ServiceCapability,
  SubscriptionCapability,
} from '../../../../__generated__/resolvers-types';
import GenericServiceCapability, {
  GenericServiceCapabilityMutator,
} from '../../../../model/kanel/public/GenericServiceCapability';
import { ServiceCapabilityMutator } from '../../../../model/kanel/public/ServiceCapability';
import { SubscriptionCapabilityMutator } from '../../../../model/kanel/public/SubscriptionCapability';
import UserServiceCapability from '../../../../model/kanel/public/UserServiceCapability';
import { PortalContext } from '../../../../model/portal-context';

export const loadUnsecureGenericCapabilitiesBy = async (
  field: GenericServiceCapabilityMutator
) => {
  return dbUnsecure<GenericServiceCapability>(
    'Generic_Service_Capability'
  ).where(field);
};

export const loadUnsecureServiceCapabilitiesBy = async (
  field: ServiceCapabilityMutator
) => {
  return dbUnsecure<ServiceCapability>('Service_Capability').where(field);
};

export const loadSubscriptionCapabilitiesBy = async (
  context: PortalContext,
  field: SubscriptionCapabilityMutator
) => {
  return db<SubscriptionCapability>(context, 'Subscription_Capability').where(
    field
  );
};

export const insertServiceCapability = async (
  context: PortalContext,
  genericServiceCapabilityData
) => {
  return db<UserServiceCapability>(context, 'UserService_Capability')
    .insert(genericServiceCapabilityData)
    .returning('*');
};
