import { PortalContext } from '@/components/me/app-portal-context';
import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';
import { useContext } from 'react';

// Mock the useContext hook

const useGranted = (capability: OrganizationCapabilityEnum) => {
  const { hasOrganizationCapability } = useContext(PortalContext);

  return hasOrganizationCapability && hasOrganizationCapability(capability);
};

export default useGranted;
