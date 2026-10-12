'use client';

import { ThreatPulseActivity } from '@/components/admin/threat-pulse/ThreatPulseActivity';
import { ThreatPulseCoverage } from '@/components/admin/threat-pulse/ThreatPulseCoverage';
import { ThreatPulseHealth } from '@/components/admin/threat-pulse/ThreatPulseHealth';
import { ThreatPulseNetworkCards } from '@/components/admin/threat-pulse/ThreatPulseNetworkCards';
import { ThreatPulsePlatforms } from '@/components/admin/threat-pulse/ThreatPulsePlatforms';
import { ThreatPulseTrending } from '@/components/admin/threat-pulse/ThreatPulseTrending';
import { pulseDayToDate } from '@/components/admin/threat-pulse/threat-pulse.utils';
import { useTranslate } from '@/hooks/use-translate';
import { portalGraphqlClient } from '@/lib/graphql-client';
import { Alert, Spinner, Text } from '@filigran/design-system';
import { useThreatPulseOverviewQuery } from '@graphql/generated';
import { threatPulseKeys } from '@graphql/threat-pulse/threat-pulse.keys';
import { useFormatter } from 'next-intl';

export const ThreatPulseDashboard = () => {
  const t = useTranslate();
  const format = useFormatter();
  const { data, isLoading, isError } = useThreatPulseOverviewQuery(
    portalGraphqlClient,
    undefined,
    { queryKey: threatPulseKeys.overview() }
  );

  if (isLoading) {
    return (
      <div className="flex justify-center p-xl">
        <Spinner
          size="lg"
          label={t('Utils.Loading')}
        />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Alert
        severity="error"
        title={t('ThreatPulse.LoadError')}
      />
    );
  }

  const overview = data.pulseNetworkOverview;
  const { settings } = overview;
  return (
    <div className="flex min-w-0 flex-col gap-xl">
      <Text
        variant="content-compact"
        className="text-text-default-secondary">
        {t('ThreatPulse.Subtitle', {
          day: format.dateTime(pulseDayToDate(overview.day), {
            dateStyle: 'long',
            timeZone: 'UTC',
          }),
        })}
      </Text>
      {!settings.enabled && (
        <Alert
          severity="warning"
          title={t('ThreatPulse.Disabled.Title')}
          description={t('ThreatPulse.Disabled.Description', {
            reason: settings.disabled_reason ?? '-',
          })}
        />
      )}
      <ThreatPulseNetworkCards overview={overview} />
      <ThreatPulseActivity activity={overview.activity} />
      <ThreatPulseCoverage overview={overview} />
      <ThreatPulseTrending overview={overview} />
      <ThreatPulsePlatforms />
      <ThreatPulseHealth rejections={overview.rejections} />
    </div>
  );
};
