import { Portal, portalContext } from '@/components/me/portal-context';
import { RESTRICTION } from '@/utils/constant';
import { useContext } from 'react';

// Mock the useContext hook

const useAdminByPass = () => {
  const { hasCapability } = useContext<Portal>(portalContext);

  return hasCapability && hasCapability(RESTRICTION.CAPABILITY_BYPASS);
};

export default useAdminByPass;
