import { PortalContext } from '@/components/me/app-portal-context';
import { RestrictionEnum } from '@generated/models/Restriction.enum';
import { useContext } from 'react';

// Mock the useContext hook

const useAdminByPass = () => {
  const { hasCapability } = useContext(PortalContext);

  return hasCapability && hasCapability(RestrictionEnum.BYPASS);
};

export default useAdminByPass;
