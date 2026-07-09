import { PortalContext } from '@/components/me/AppPortalContext';
import { OrganizationCapability } from '@graphql/generated';
import { useContext } from 'react';

// Mock the useContext hook

const useGranted = (capability: OrganizationCapability) => {
  const { hasOrganizationCapability } = useContext(PortalContext);

  return hasOrganizationCapability && hasOrganizationCapability(capability);
};

export default useGranted;
