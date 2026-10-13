import { ThreatPulseKindMatrix } from '@/components/admin/threat-pulse/ThreatPulseKindMatrix';
import { ThreatPulseSection } from '@/components/admin/threat-pulse/ThreatPulseSection';
import { BarList, BarListItem } from '@/components/ui/bar-list';
import { useTranslate } from '@/hooks/use-translate';
import { type ThreatPulseOverviewQuery } from '@graphql/generated';

type Overview = ThreatPulseOverviewQuery['pulseNetworkOverview'];

interface ThreatPulseCoverageProps {
  overview: Overview;
}

export const ThreatPulseCoverage = ({ overview }: ThreatPulseCoverageProps) => {
  const t = useTranslate();

  const detail = (platforms: number) =>
    t('ThreatPulse.Coverage.Platforms', { count: platforms });

  const lists: { id: string; title: string; items: BarListItem[] }[] = [
    {
      id: 'sectors',
      title: t('ThreatPulse.Coverage.Sectors'),
      items: overview.sectors.map((sector) => ({
        key: sector.sector_bucket,
        label: t(`ThreatPulse.Sector.${sector.sector_bucket}`),
        value: sector.events,
        detail: detail(sector.platforms),
      })),
    },
    {
      id: 'regions',
      title: t('ThreatPulse.Coverage.Regions'),
      items: overview.regions.map((region) => ({
        key: region.region_bucket,
        label: t(`ThreatPulse.Region.${region.region_bucket}`),
        value: region.events,
        detail: detail(region.platforms),
      })),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-l lg:grid-cols-2">
      {lists.map((list) => (
        <ThreatPulseSection
          key={list.id}
          title={list.title}
          description={t('ThreatPulse.Coverage.Description')}>
          <BarList
            aria-label={list.title}
            items={list.items}
            formatValue={(events) =>
              t('ThreatPulse.Coverage.Events', { count: events })
            }
            emptyLabel={t('ThreatPulse.Coverage.Empty')}
          />
        </ThreatPulseSection>
      ))}
      <div className="min-w-0 lg:col-span-2">
        <ThreatPulseSection
          title={t('ThreatPulse.Coverage.Kinds')}
          description={t('ThreatPulse.Coverage.Description')}>
          <ThreatPulseKindMatrix
            kinds={overview.kinds}
            caption={t('ThreatPulse.Coverage.Kinds')}
          />
        </ThreatPulseSection>
      </div>
    </div>
  );
};
