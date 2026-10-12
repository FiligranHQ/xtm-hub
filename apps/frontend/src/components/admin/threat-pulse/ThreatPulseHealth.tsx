import { ThreatPulseSection } from '@/components/admin/threat-pulse/ThreatPulseSection';
import {
  pulseDayToDate,
  rejectionId,
  ThreatPulseRejection,
} from '@/components/admin/threat-pulse/threat-pulse.utils';
import { BarList } from '@/components/ui/bar-list';
import { useTranslate } from '@/hooks/use-translate';
import { useFormatter } from 'next-intl';

interface ThreatPulseHealthProps {
  rejections: ThreatPulseRejection[];
}

export const ThreatPulseHealth = ({ rejections }: ThreatPulseHealthProps) => {
  const t = useTranslate();
  const format = useFormatter();

  return (
    <ThreatPulseSection
      title={t('ThreatPulse.Health.Title')}
      description={t('ThreatPulse.Health.Description')}>
      <BarList
        aria-label={t('ThreatPulse.Health.Title')}
        items={rejections.map((rejection) => ({
          key: rejectionId(rejection),
          label: t('ThreatPulse.Health.Rejection', {
            operation: t(`ThreatPulse.Operation.${rejection.operation}`),
            code: t(`ThreatPulse.RejectionCode.${rejection.code}`),
          }),
          value: rejection.requests,
          detail: t('ThreatPulse.Health.LastDay', {
            day: format.dateTime(pulseDayToDate(rejection.last_day), {
              dateStyle: 'medium',
              timeZone: 'UTC',
            }),
          }),
        }))}
        formatValue={(requests) =>
          t('ThreatPulse.Health.Requests', { count: requests })
        }
        emptyLabel={t('ThreatPulse.Health.Empty')}
      />
    </ThreatPulseSection>
  );
};
