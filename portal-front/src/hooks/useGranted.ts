import { Portal, portalContext } from '@/components/me/portal-context';
import { ORGANIZATION_CAPACITY } from '@/utils/constant';
import { useContext } from 'react';

// Mock the useContext hook

const useGranted = (capability: ORGANIZATION_CAPACITY) => {
  const { hasOrganizationCapability } = useContext<Portal>(portalContext);

  return hasOrganizationCapability && hasOrganizationCapability(capability);
};

export default useGranted;
