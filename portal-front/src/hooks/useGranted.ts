import { PortalContext } from '@/components/me/app-portal-context';
import { OrganizationCapabilityName } from '@/utils/constant';
import { useContext } from 'react';

// Mock the useContext hook

const useGranted = (capability: OrganizationCapabilityName) => {
  const { hasOrganizationCapability } = useContext(PortalContext);

  return hasOrganizationCapability && hasOrganizationCapability(capability);
};

export default useGranted;
