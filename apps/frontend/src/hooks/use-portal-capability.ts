import { PortalContext } from '@/components/me/AppPortalContext';
import { PortalCapability } from '@graphql/generated';
import { useContext } from 'react';

// Mock the useContext hook

export const useAdminByPass = () => {
  const { hasCapability } = useContext(PortalContext);

  return hasCapability && hasCapability(PortalCapability.Bypass);
};

export const useUserHasPortalCapability = (
  restrictions: PortalCapability[]
) => {
  const { hasCapability } = useContext(PortalContext);
  return (
    hasCapability &&
    restrictions.some((restriction) => hasCapability(restriction))
  );
};
