import { FiligranTimelineMapping } from '@/components/epic/epic-item/timeline-mapping';
import { TimelineEnum } from '@generated/models/Timeline.enum';
import { describe, expect, it } from 'vitest';

describe('FiligranTimelineMapping', () => {
  it('contains all Timeline items from enum', () => {
    expect(Object.keys(FiligranTimelineMapping).sort()).toEqual(
      Object.values(TimelineEnum).sort()
    );
  });

  it.each`
    timeline                            | expectedColor
    ${TimelineEnum.NOW}                 | ${'orange'}
    ${TimelineEnum.NEXT}                | ${'primary'}
    ${TimelineEnum.UNDER_CONSIDERATION} | ${'green'}
    ${TimelineEnum.FINISHED}            | ${'white'}
  `(
    'maps $timeline with expected color',
    ({
      timeline,
      expectedColor,
    }: {
      timeline: TimelineEnum;
      expectedColor: string;
    }) => {
      const metadata = FiligranTimelineMapping[timeline];

      expect(metadata.color).toBe(expectedColor);
    }
  );
});
