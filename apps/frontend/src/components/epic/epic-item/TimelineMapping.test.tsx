import { FiligranTimelineMapping } from '@/components/epic/epic-item/TimelineMapping';
import { Timeline } from '@graphql/generated';
import { describe, expect, it } from 'vitest';

describe('FiligranTimelineMapping', () => {
  it('contains all Timeline items from enum', () => {
    expect(Object.keys(FiligranTimelineMapping).sort()).toEqual(
      Object.values(Timeline).sort()
    );
  });

  it.each`
    timeline                       | expectedColor
    ${Timeline.Now}                | ${'orange'}
    ${Timeline.Next}               | ${'primary'}
    ${Timeline.UnderConsideration} | ${'green'}
    ${Timeline.Finished}           | ${'white'}
  `(
    'maps $timeline with expected color',
    ({
      timeline,
      expectedColor,
    }: {
      timeline: Timeline;
      expectedColor: string;
    }) => {
      const metadata = FiligranTimelineMapping[timeline];

      expect(metadata.color).toBe(expectedColor);
    }
  );
});
