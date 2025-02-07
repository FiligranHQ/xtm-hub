import { Portal, portalContext } from '@/components/me/portal-context';
import { Restriction } from '@generated/meContext_fragment.graphql';
import { useContext } from 'react';

// Mock the useContext hook

const useGranted = (capability: Restriction) => {
  const { hasCapability } = useContext<Portal>(portalContext);

  return hasCapability && hasCapability(capability);
};

export default useGranted;
