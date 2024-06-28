import {useContext} from 'react';
import {Portal, portalContext} from '@/components/portal-context';
import {Restriction} from '../../__generated__/meContext_fragment.graphql';

// Mock the useContext hook

const useGranted = (capability: Restriction) => {
  const { hasCapability } = useContext<Portal>(portalContext);

  return hasCapability && hasCapability(capability);
};

export default useGranted;
