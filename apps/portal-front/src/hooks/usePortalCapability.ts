import { PortalContext } from '@/components/me/app-portal-context';
import { RestrictionEnum } from '@generated/models/Restriction.enum';
import { useContext } from 'react';

// Mock the useContext hook

export const useAdminByPass = () => {
  const { hasCapability } = useContext(PortalContext);

  return hasCapability && hasCapability(RestrictionEnum.BYPASS);
};

export const useUserHasPortalCapability = (restrictions: RestrictionEnum[]) => {
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
