import { ThreatPulseKindMatrix } from '@/components/admin/threat-pulse/ThreatPulseKindMatrix';
import testRender from '@/utils/test/test-render';
import { PulseEventKind, PulseObjectType } from '@graphql/generated';
import { screen, within } from '@testing-library/react';

const CAPTION = 'Coverage by type and event';

describe('ThreatPulseKindMatrix', () => {
  it('should cross the object types with the event kinds, busiest type first', () => {
    // When
    testRender(
      <ThreatPulseKindMatrix
        caption={CAPTION}
        kinds={[
          {
            object_type: PulseObjectType.Indicator,
            event_kind: PulseEventKind.Sighted,
            platforms: 12,
            events: 60000,
          },
          {
            object_type: PulseObjectType.Indicator,
            event_kind: PulseEventKind.Created,
            platforms: 3,
            events: 1000,
          },
          {
            object_type: PulseObjectType.Malware,
            event_kind: PulseEventKind.Detected,
            platforms: 5,
            events: 90000,
          },
        ]}
      />
    );

    // Then
    const table = screen.getByRole('table', { name: CAPTION });
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((header) => header.textContent)
    ).toEqual([
      'ThreatPulse.Coverage.ObjectType',
      'ThreatPulse.EventKind.created',
      'ThreatPulse.EventKind.sighted',
      'ThreatPulse.EventKind.detected',
      'ThreatPulse.EventKind.hunted',
      'ThreatPulse.EventKind.referenced',
    ]);
    const types = within(table).getAllByRole('rowheader');
    expect(types.map((header) => header.textContent)).toEqual([
      'ThreatPulse.ObjectType.malware',
      'ThreatPulse.ObjectType.indicator',
    ]);
    const indicator = within(types[1].closest('tr') as HTMLElement);
    expect(indicator.getByText('60,000')).toBeInTheDocument();
    expect(indicator.getByText('1,000')).toBeInTheDocument();
    expect(indicator.getAllByText('-')).toHaveLength(3);
  });

  it('should say so when no platform reported any event', () => {
    // When
    testRender(
      <ThreatPulseKindMatrix
        caption={CAPTION}
        kinds={[]}
      />
    );

    // Then
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByText('ThreatPulse.Coverage.Empty')).toBeInTheDocument();
  });
});
