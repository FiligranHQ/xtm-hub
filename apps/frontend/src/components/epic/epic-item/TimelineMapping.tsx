import { Timeline } from '@graphql/generated';

export interface FiligranTimelineMetadata {
  color: string;
}

export const FiligranTimelineMapping: Record<
  Timeline,
  FiligranTimelineMetadata
> = {
  [Timeline.Now]: {
    color: 'orange',
  },
  [Timeline.Next]: {
    color: 'primary',
  },
  [Timeline.UnderConsideration]: {
    color: 'green',
  },
  [Timeline.Finished]: {
    color: 'white',
  },
};
