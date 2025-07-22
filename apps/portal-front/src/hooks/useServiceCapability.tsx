import { ServiceCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import useAdminByPass from '@/hooks/useAdminByPass';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import { useMemo } from 'react';

const useServiceCapability = (
  capability: ServiceCapabilityName,
  serviceInstance?: NonNullable<serviceByIdQuery$data['serviceInstanceById']>
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
