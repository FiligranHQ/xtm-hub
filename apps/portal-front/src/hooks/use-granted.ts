import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';
import { useContext } from 'react';
import { PortalContext } from '@/components/me/AppPortalContext';

// Mock the useContext hook

const useGranted = (capability: OrganizationCapabilityEnum) => {
  const { hasOrganizationCapability } = useContext(PortalContext);

  return hasOrganizationCapability && hasOrganizationCapability(capability);
};

export default useGranted;
