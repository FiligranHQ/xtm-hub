import useGranted from '@/hooks/use-granted';
import { useAdminByPass } from '@/hooks/use-portal-capability';
import { OrganizationCapability } from '@graphql/generated';

/**
 * Mirrors the server guard on createDeploymentRequest:
 * ADMINISTRATE_ORGANIZATION or MANAGE_PLATFORM_REGISTRATION,
 * with a bypass for platform administrators.
 */
export const useCanRequestPlatformTrial = (): boolean => {
  const canAdministrateOrganization = useGranted(
    OrganizationCapability.AdministrateOrganization
  );
  const canManagePlatformRegistration = useGranted(
    OrganizationCapability.ManagePlatformRegistration
  );
  const isPlatformAdmin = useAdminByPass();

  return Boolean(
    canAdministrateOrganization ||
    canManagePlatformRegistration ||
    isPlatformAdmin
  );
};
