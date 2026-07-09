import { useAdminByPass } from '@/hooks/use-portal-capability';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { ServiceRestriction } from '@graphql/generated';
import { useMemo } from 'react';

const useServiceCapability = (
  capability: ServiceRestriction,
  serviceInstance?: serviceInstance_fragment$data
) => {
  const canBypass = useAdminByPass();
  return useMemo(() => {
    return (
      canBypass ||
      !!serviceInstance?.capabilities?.some(
        (capa) => capa?.toUpperCase() === capability
      )
    );
  }, [canBypass, serviceInstance, capability]);
};

export default useServiceCapability;
