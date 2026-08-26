import { useAdminByPass } from '@/hooks/use-portal-capability';
import { portalGraphqlClient } from '@/lib/graphql-client';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import {
  ServiceRestriction,
  useServiceUserCapabilitiesQuery,
} from '@graphql/generated';
import { useMemo } from 'react';

type UseServiceCapabilityOptions = {
  withSubscriptionId?: boolean;
};

export type UseServiceCapabilityWithSubscriptionId = {
  hasCapability: boolean;
  subscriptionId: string | null;
};

function useServiceCapability(
  capability: ServiceRestriction,
  serviceInstance?: serviceInstance_fragment$data
): boolean;
function useServiceCapability(
  capability: ServiceRestriction,
  serviceInstance: serviceInstance_fragment$data | undefined,
  options: { withSubscriptionId: true }
): UseServiceCapabilityWithSubscriptionId;
function useServiceCapability(
  capability: ServiceRestriction,
  serviceInstance?: serviceInstance_fragment$data,
  options?: UseServiceCapabilityOptions
) {
  const canBypass = useAdminByPass();
  const { data } = useServiceUserCapabilitiesQuery(
    portalGraphqlClient,
    {
      service_instance_id: serviceInstance?.id ?? '',
    },
    {
      enabled: !!serviceInstance?.id,
      queryKey: ['service-user-capabilities', serviceInstance?.id],
    }
  );
  const rawSubscriptionId = data?.userServiceCapabilities?.[0]?.subscription_id;
  const subscriptionId =
    typeof rawSubscriptionId === 'string' ? rawSubscriptionId : null;

  const hasCapability = useMemo(() => {
    const fetchedServiceCapabilities = data?.userServiceCapabilities?.flatMap(
      (userServiceCapability) => [
        userServiceCapability?.generic_service_capability?.name,
        userServiceCapability?.subscription_capability?.service_capability
          ?.name,
      ]
    );
    const userCapabilities =
      fetchedServiceCapabilities ?? serviceInstance?.capabilities;

    return (
      canBypass ||
      !!userCapabilities?.some((capa) => capa?.toUpperCase() === capability)
    );
  }, [canBypass, data, serviceInstance, capability]);

  if (options?.withSubscriptionId) {
    return {
      hasCapability,
      subscriptionId,
    };
  }

  return hasCapability;
}

export default useServiceCapability;
