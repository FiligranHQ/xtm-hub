'use client';

import { registeredPlatformByServiceInstanceIdFragment } from '@/components/registration/register/register.graphql';
import { useTranslate } from '@/hooks/use-translate';
import { portalGraphqlClient } from '@/lib/graphql-client';
import { computePeriodProgress, useDateFormatter } from '@/utils/date';
import { ProgressBar } from '@filigran/design-system';
import { registeredPlatformByServiceInstanceId_fragment$key } from '@generated/registeredPlatformByServiceInstanceId_fragment.graphql';
import {
  CommercialModel,
  useRegisteredSaasPlatformMetadataQuery,
} from '@graphql/generated';
import { registrationKeys } from '@graphql/registration/registration.keys';
import { useId } from 'react';
import { useFragment } from 'react-relay';

interface RegistrationMetadataProps {
  registeredPlatform: registeredPlatformByServiceInstanceId_fragment$key;
}

export const RegistrationMetadata = ({
  registeredPlatform,
}: RegistrationMetadataProps) => {
  const t = useTranslate();
  const formatDate = useDateFormatter();
  const contractLabelId = useId();
  const daysLeftId = useId();

  const platform =
    useFragment<registeredPlatformByServiceInstanceId_fragment$key>(
      registeredPlatformByServiceInstanceIdFragment,
      registeredPlatform
    );
  const isSaas = platform.commercial_model === CommercialModel.Saas;

  const variables = { platformId: platform.platform_id };
  const { data, isPending } = useRegisteredSaasPlatformMetadataQuery(
    portalGraphqlClient,
    variables,
    {
      queryKey: registrationKeys.registeredSaasPlatformMetadata(variables),
      enabled: isSaas,
    }
  );
  const metadata = data?.registeredSaasPlatformMetadata;

  if (!isSaas) {
    return (
      <div className="mt-xl text-default-secondary">
        {t('Register.Metrics.Metadata.ReservedForSaas')}
      </div>
    );
  }

  if (isPending) {
    return null;
  }

  const contractPeriod =
    metadata?.start_date && metadata?.end_date
      ? computePeriodProgress(metadata?.start_date, metadata?.end_date)
      : null;

  return (
    <section className="flex justify-between p-xl">
      <ul className="text-sm flex flex-col gap-l">
        <li>
          <span className="mr-xs text-default-secondary">
            {t('Register.Metrics.Metadata.Hostname')}:
          </span>
          {metadata?.hostname ?? t('Register.Metrics.Metadata.Unavailable')}
        </li>
        <li>
          <span className="mr-xs text-default-secondary">
            {t('Register.Metrics.Metadata.SubscribedPlan')}:
          </span>
          {metadata?.plan ?? t('Register.Metrics.Metadata.Unavailable')}
        </li>
        <li className="flex flex-col gap-s">
          <span>
            <span
              id={contractLabelId}
              className="mr-xs text-default-secondary">
              {t('Register.Metrics.Metadata.Contract')}:
            </span>
            {contractPeriod
              ? `${formatDate(metadata?.start_date)} → ${formatDate(metadata?.end_date)}`
              : t('Register.Metrics.Metadata.Unavailable')}
          </span>
          {contractPeriod && (
            <div className="flex items-center gap-s">
              <ProgressBar
                value={contractPeriod.elapsedPercent}
                aria-labelledby={`${contractLabelId} ${daysLeftId}`}
                className="flex-1"
              />
              <span
                id={daysLeftId}
                className="shrink-0">
                {t('Register.Metrics.Metadata.DaysLeft', {
                  days: contractPeriod.daysLeft,
                })}
              </span>
            </div>
          )}
        </li>
        <li>
          <span className="mr-xs text-default-secondary">
            {t('Register.Metrics.Metadata.RegionalArea')}:
          </span>
          {metadata?.region ?? t('Register.Metrics.Metadata.Unavailable')}
        </li>
        <li>
          <span className="mr-xs text-default-secondary">
            {t('Register.Metrics.Metadata.PlatformVersion')}:
          </span>
          {metadata?.version ?? t('Register.Metrics.Metadata.Unavailable')}
        </li>
      </ul>
    </section>
  );
};
