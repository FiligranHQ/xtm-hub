'use client';

import { RegistrationDetails } from '@/components/service/registration/RegistrationDetails';
import { RegistrationMetadata } from '@/components/service/registration/RegistrationMetadata';
import { Separator } from '@/components/ui/separator';
import { useIsFeatureEnabled } from '@/hooks/use-is-feature-enabled';
import { useTranslate } from '@/hooks/use-translate';
import { portalGraphqlClient } from '@/lib/graphql-client';
import { registeredPlatformByServiceInstanceId_fragment$key } from '@generated/registeredPlatformByServiceInstanceId_fragment.graphql';
import {
  FeatureFlag,
  useRegisteredSaasPlatformDataQuery,
} from '@graphql/generated';
import { productInformationKeys } from '@graphql/product-information/product-information.keys';

// Matches the backend cache: a remount within a minute would only get the same answer back.
const SAAS_PLATFORM_DATA_STALE_TIME = 60_000;

interface PlatformInformationProps {
  registeredPlatform: registeredPlatformByServiceInstanceId_fragment$key;
  serviceInstanceId: string;
  isSaas: boolean;
}

export const PlatformInformation = ({
  registeredPlatform,
  serviceInstanceId,
  isSaas,
}: PlatformInformationProps) => {
  const t = useTranslate();
  const isSaasMetricsEnabled = useIsFeatureEnabled(FeatureFlag.SaasMetrics);
  const showMetadata = isSaasMetricsEnabled && isSaas;

  const variables = {
    input: { service_instance_id: serviceInstanceId },
  };
  const { data, isPending } = useRegisteredSaasPlatformDataQuery(
    portalGraphqlClient,
    variables,
    {
      queryKey: productInformationKeys.registeredSaasPlatformData(variables),
      enabled: showMetadata,
      staleTime: SAAS_PLATFORM_DATA_STALE_TIME,
    }
  );

  return (
    <div className="my-3 layer-2 bg-filigran-brand-primary-transparency-10 p-6">
      <h2>{t('Register.Details.PlatformInformation')}</h2>
      <Separator className="m-3" />
      <div className="grid grid-cols-2">
        <RegistrationDetails registeredPlatform={registeredPlatform} />
        {showMetadata && (
          <RegistrationMetadata
            metadata={data?.registeredSaasPlatformData?.metadata}
            isLoading={isPending}
          />
        )}
      </div>
    </div>
  );
};
