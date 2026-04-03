import { FiligranProductMapping } from '@/components/epic/epic-item/filigran-product-mapping';
import { FiligranTimelineMapping } from '@/components/epic/epic-item/timeline-mapping';
import { FiligranProductEnum } from '@generated/models/FiligranProduct.enum';
import { TimelineEnum } from '@generated/models/Timeline.enum';
import { describe, expect, it } from 'vitest';

describe('FiligranTimelineMapping', () => {
  it('contains all Timeline items from enum', () => {
    expect(Object.keys(FiligranProductMapping).sort()).toEqual(
      Object.values(FiligranProductEnum).sort()
    );
  });

  it.each`
    timeline                            | expectedColor
    ${TimelineEnum.NOW}                 | ${'orange'}
    ${TimelineEnum.NEXT}                | ${'primary'}
    ${TimelineEnum.UNDER_CONSIDERATION} | ${'green'}
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
