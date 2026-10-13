import { useTranslate } from '@/hooks/use-translate';
import { Text } from '@filigran/design-system';
import {
  PulseEventKind,
  type ThreatPulseOverviewQuery,
} from '@graphql/generated';
import { useFormatter } from 'next-intl';

type Kind = ThreatPulseOverviewQuery['pulseNetworkOverview']['kinds'][number];

const EVENT_KINDS = [
  PulseEventKind.Created,
  PulseEventKind.Sighted,
  PulseEventKind.Detected,
  PulseEventKind.Hunted,
  PulseEventKind.Referenced,
] as const;

const CELL = 'px-s py-xs';

interface ThreatPulseKindMatrixProps {
  kinds: readonly Kind[];
  caption: string;
}

export const ThreatPulseKindMatrix = ({
  kinds,
  caption,
}: ThreatPulseKindMatrixProps) => {
  const t = useTranslate();
  const format = useFormatter();

  if (kinds.length === 0) {
    return (
      <Text
        variant="content-compact"
        className="text-text-default-secondary">
        {t('ThreatPulse.Coverage.Empty')}
      </Text>
    );
  }

  const cells = new Map(
    kinds.map((kind) => [`${kind.object_type}-${kind.event_kind}`, kind])
  );
  const totals = new Map<Kind['object_type'], number>();
  for (const kind of kinds) {
    totals.set(
      kind.object_type,
      (totals.get(kind.object_type) ?? 0) + kind.events
    );
  }
  const types = [...totals.keys()].sort(
    (left, right) => (totals.get(right) ?? 0) - (totals.get(left) ?? 0)
  );

  return (
    <div className="min-w-0 overflow-x-auto">
      <table className="w-full border-collapse">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-elevation-border-subtle-layer-1">
            <th
              scope="col"
              className={`${CELL} pl-0 text-left`}>
              <Text
                as="span"
                variant="content-caption"
                className="text-text-default-secondary">
                {t('ThreatPulse.Coverage.ObjectType')}
              </Text>
            </th>
            {EVENT_KINDS.map((eventKind) => (
              <th
                key={eventKind}
                scope="col"
                className={`${CELL} text-right`}>
                <Text
                  as="span"
                  variant="content-caption"
                  className="capitalize text-text-default-secondary">
                  {t(`ThreatPulse.EventKind.${eventKind}`)}
                </Text>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {types.map((objectType) => (
            <tr
              key={objectType}
              className="border-b border-elevation-border-subtle-layer-1 last:border-b-0">
              <th
                scope="row"
                className={`${CELL} pl-0 text-left`}>
                <Text
                  as="span"
                  variant="content-compact-medium">
                  {t(`ThreatPulse.ObjectType.${objectType}`)}
                </Text>
              </th>
              {EVENT_KINDS.map((eventKind) => {
                const cell = cells.get(`${objectType}-${eventKind}`);
                return (
                  <td
                    key={eventKind}
                    className={`${CELL} text-right`}>
                    {cell ? (
                      <span className="flex flex-col items-end">
                        <Text
                          as="span"
                          variant="content-compact-medium">
                          {format.number(cell.events)}
                        </Text>
                        <Text
                          as="span"
                          variant="content-caption"
                          className="text-text-default-secondary">
                          {t('ThreatPulse.Coverage.PlatformCount', {
                            count: cell.platforms,
                          })}
                        </Text>
                      </span>
                    ) : (
                      <Text
                        as="span"
                        variant="content-compact"
                        className="text-text-default-secondary">
                        -
                      </Text>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
