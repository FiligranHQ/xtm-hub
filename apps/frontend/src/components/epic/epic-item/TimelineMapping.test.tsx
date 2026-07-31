import { FiligranTimelineMapping } from '@/components/epic/epic-item/TimelineMapping';
import { Timeline } from '@graphql/generated';
import { describe, expect, it } from 'vitest';

describe('FiligranTimelineMapping', () => {
  it.each`
    timelineKey                    | expectedTextClass
    ${'draft'}                     | ${'text-feedback-alert-primary'}
    ${Timeline.Now}                | ${'text-feedback-warning-primary'}
    ${Timeline.Next}               | ${'text-feedback-info-primary'}
    ${Timeline.UnderConsideration} | ${'text-feedback-success-primary'}
    ${Timeline.Finished}           | ${'text-feedback-neutral-primary'}
  `(
    'maps $timelineKey with expected textClass $expectedTextClass',
    ({
      timelineKey,
      expectedTextClass,
    }: {
      timelineKey: keyof typeof FiligranTimelineMapping;
      expectedTextClass: string;
    }) => {
      const metadata = FiligranTimelineMapping[timelineKey];
      expect(metadata.textClass).toBe(expectedTextClass);
    }
  );
});
