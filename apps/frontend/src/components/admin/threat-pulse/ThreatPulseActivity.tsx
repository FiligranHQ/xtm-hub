import { ThreatPulseSection } from '@/components/admin/threat-pulse/ThreatPulseSection';
import {
  activityValue,
  pulseDayToDate,
  THREAT_PULSE_ACTIVITY_METRICS,
  ThreatPulseActivityDay,
  ThreatPulseActivityMetric,
} from '@/components/admin/threat-pulse/threat-pulse.utils';
import { ColumnChart } from '@/components/ui/column-chart';
import { useTranslate } from '@/hooks/use-translate';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@filigran/design-system';
import { useFormatter } from 'next-intl';
import { useState } from 'react';

interface ThreatPulseActivityProps {
  activity: ThreatPulseActivityDay[];
}

export const ThreatPulseActivity = ({ activity }: ThreatPulseActivityProps) => {
  const t = useTranslate();
  const format = useFormatter();
  const [metric, setMetric] = useState<ThreatPulseActivityMetric>('records');

  const dayLabel = (day: string) =>
    format.dateTime(pulseDayToDate(day), {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    });

  return (
    <ThreatPulseSection
      title={t('ThreatPulse.Activity.Title')}
      description={t('ThreatPulse.Activity.Description')}>
      <Tabs
        value={metric}
        onValueChange={(value) => setMetric(value as ThreatPulseActivityMetric)}
        activationMode="automatic">
        <TabsList>
          {THREAT_PULSE_ACTIVITY_METRICS.map((value) => (
            <TabsTrigger
              key={value}
              value={value}>
              {t(`ThreatPulse.Activity.Metric.${value}`)}
            </TabsTrigger>
          ))}
        </TabsList>
        {THREAT_PULSE_ACTIVITY_METRICS.map((value) => (
          <TabsContent
            key={value}
            value={value}
            className="pt-l">
            <ColumnChart
              aria-label={t(`ThreatPulse.Activity.Chart.${value}`)}
              formatValue={(count) => format.number(count)}
              data={activity.map((day) => ({
                key: day.day,
                label: dayLabel(day.day),
                value: activityValue(day, value),
              }))}
            />
          </TabsContent>
        ))}
      </Tabs>
    </ThreatPulseSection>
  );
};
