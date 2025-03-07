import { PortalContext } from '@/components/me/app-portal-context';
import { ORGANIZATION_CAPACITY } from '@/utils/constant';
import { useContext } from 'react';

// Mock the useContext hook

const useGranted = (capability: ORGANIZATION_CAPACITY) => {
  const { hasOrganizationCapability } = useContext(PortalContext);

  return hasOrganizationCapability && hasOrganizationCapability(capability);
};

export default useGranted;
