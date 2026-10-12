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
    {
      id: 'kinds',
      title: t('ThreatPulse.Coverage.Kinds'),
      items: overview.kinds.map((kind) => ({
        key: `${kind.object_type}-${kind.event_kind}`,
        label: t('ThreatPulse.Coverage.Kind', {
          type: t(`ThreatPulse.ObjectType.${kind.object_type}`),
          kind: t(`ThreatPulse.EventKind.${kind.event_kind}`),
        }),
        value: kind.events,
        detail: detail(kind.platforms),
      })),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-l xl:grid-cols-3">
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
    </div>
  );
};
