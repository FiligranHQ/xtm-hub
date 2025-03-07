import { PortalContext } from '@/components/me/app-portal-context';
import { RESTRICTION } from '@/utils/constant';
import { useContext } from 'react';

// Mock the useContext hook

const useAdminByPass = () => {
  const { hasCapability } = useContext(PortalContext);

  return hasCapability && hasCapability(RESTRICTION.CAPABILITY_BYPASS);
};

export default useAdminByPass;
