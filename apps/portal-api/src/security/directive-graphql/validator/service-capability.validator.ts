import { UserLoadUserBy } from '../../../model/user';
import {
  getCapabilityUser,
  userHasBypassCapability,
} from '../../../modules/security-management/capability/auth.helper';
export const SERVICE_CAPABILITY_DIRECTIVE_NAME = 'service_capa';

export type ServiceCapabilityArgs = {
  service_instance_id?: string;
  subscription_id?: string;
  serviceInstanceId?: string;
};

/**
 * Validates service instance arguments
 */
const validateServiceArgs = (args: ServiceCapabilityArgs): void => {
  const hasValidArg =
    args.serviceInstanceId || args.service_instance_id || args.subscription_id;

  if (!hasValidArg) {
    throw new Error(
      'serviceInstanceId, service_instance_id, or subscription_id is required for service capability directive'
    );
  }
};

/**
 * Normalizes service arguments to a consistent format
 */
const normalizeServiceArgs = (args: ServiceCapabilityArgs) => {
  if (args.serviceInstanceId) {
    return { service_instance_id: args.serviceInstanceId };
  }
  return args;
};

/**
 * Checks if a user has the required service capabilities
 */
export const hasServiceCapability = async (
  user: UserLoadUserBy,
  args: ServiceCapabilityArgs,
  capabilitiesRequired: string[]
): Promise<boolean> => {
  // Admin bypass
  if (userHasBypassCapability(user)) {
    return true;
  }

  // Validate arguments
  validateServiceArgs(args);

  // Normalize arguments
  const normalizedArgs = normalizeServiceArgs(args);

  // Check user capabilities for the service
  const capabilityUser = await getCapabilityUser(user, normalizedArgs);
  const userCapabilities = capabilityUser?.capabilities ?? [];

  return userCapabilities.some((capability) =>
    capabilitiesRequired.includes(capability)
  );
};
