import { OrganizationId } from '../../../model/kanel/public/Organization';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { UserId } from '../../../model/kanel/public/User';
import {
  CompositeKey,
  defineCompositeKey,
} from '../../../utils/dataloader-key.util';

// `organization_subscribed` and `subscriptions` share the same key shape.
interface OrganizationServiceInstanceFields extends Record<string, string> {
  organizationId: OrganizationId;
  serviceInstanceId: ServiceInstanceId;
}

export type OrganizationServiceInstanceKey =
  CompositeKey<OrganizationServiceInstanceFields>;

export const organizationServiceInstanceKey =
  defineCompositeKey<OrganizationServiceInstanceFields>([
    'organizationId',
    'serviceInstanceId',
  ]);

// `capabilities` and `user_joined` share the same key shape.
interface ServiceInstanceUserOrganizationFields extends Record<string, string> {
  serviceInstanceId: ServiceInstanceId;
  userId: UserId;
  organizationId: OrganizationId;
}

export type ServiceInstanceUserOrganizationKey =
  CompositeKey<ServiceInstanceUserOrganizationFields>;

export const serviceInstanceUserOrganizationKey =
  defineCompositeKey<ServiceInstanceUserOrganizationFields>([
    'serviceInstanceId',
    'userId',
    'organizationId',
  ]);
