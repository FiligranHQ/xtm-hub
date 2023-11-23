import { useContext } from 'react';
import { Portal, portalContext } from '@/components/context';
import { Restriction } from '../../__generated__/context_fragment.graphql';

const useGranted = (capability: Restriction) => {
  const { hasCapability } = useContext<Portal>(portalContext);
  return hasCapability && hasCapability(capability);
};

export default useGranted;
