import { TimelineEnum } from '@generated/models/Timeline.enum';

export interface FiligranTimelineMetadata {
  color: string;
}

export const FiligranTimelineMapping: Record<
  TimelineEnum,
  FiligranTimelineMetadata
> = {
  [TimelineEnum.NOW]: {
    color: 'orange',
  },
  [TimelineEnum.NEXT]: {
    color: 'primary',
  },
  [TimelineEnum.UNDER_CONSIDERATION]: {
    color: 'green',
  },
  [TimelineEnum.FINISHED]: {
    color: 'white',
  },
};
