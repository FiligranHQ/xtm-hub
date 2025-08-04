import { ServiceCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import useAdminByPass from '@/hooks/useAdminByPass';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { useMemo } from 'react';

const useServiceCapability = (
  capability: ServiceCapabilityName,
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
