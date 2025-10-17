import { UserLoadUserBy } from '../../model/user';
import { ServiceCapabilityArgs } from './validators/service-capability.validator';

export type AuthFn = (user: UserLoadUserBy) => boolean;

export type RoleFn = (
  user: UserLoadUserBy,
  roleRequiredInSchema: string[]
) => boolean;

export type ServiceFn = (
  user: UserLoadUserBy,
  args: ServiceCapabilityArgs,
  roleRequiredInSchema: string[]
) => Promise<boolean>;
