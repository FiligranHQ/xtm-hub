import { ServiceCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import useGranted from '@/hooks/useGranted';
import { RESTRICTION } from '@/utils/constant';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import { useMemo } from 'react';

const useServiceCapability = (
  capability: ServiceCapabilityName,
  serviceInstance?: NonNullable<serviceByIdQuery$data['serviceInstanceById']>
) => {
  const canBypass = useGranted(RESTRICTION.CAPABILITY_BYPASS);
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
