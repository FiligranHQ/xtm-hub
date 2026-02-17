import { PortalContext } from '@/components/me/app-portal-context';
import { PortalCapabilityEnum } from '@generated/models/PortalCapability.enum';
import { useContext } from 'react';

// Mock the useContext hook

export const useAdminByPass = () => {
  const { hasCapability } = useContext(PortalContext);

  return hasCapability && hasCapability(PortalCapabilityEnum.BYPASS);
};

export const useUserHasPortalCapability = (
  restrictions: PortalCapabilityEnum[]
) => {
  const { hasCapability } = useContext(PortalContext);
  return (
    hasCapability &&
    restrictions.some((restriction) => hasCapability(restriction))
  );
};

export const useUserHasAtLeastOnePortalCapabilities = () => {
  const { me } = useContext(PortalContext);
  return (me?.capabilities ?? []).length > 0;
};
