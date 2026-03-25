'use client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@filigran/ui';
import { TimelineEnum } from '@generated/models/Timeline.enum';
import { useTranslations } from 'next-intl';

export type EpicTimelineFilterType = 'all' | TimelineEnum;

interface EpicTimelineFilterProps {
  selectedTimeline: EpicTimelineFilterType;
  onTimelineChange: (timeline: EpicTimelineFilterType) => void;
}

export const EpicTimelineFilter = ({
  selectedTimeline,
  onTimelineChange,
}: EpicTimelineFilterProps) => {
  const t = useTranslations();

  return (
    <Select
      value={selectedTimeline}
      onValueChange={(value) =>
        onTimelineChange(value as EpicTimelineFilterType)
      }>
      <SelectTrigger>
        <SelectValue placeholder={t('Epic.AllTimelines')} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{t('Epic.AllTimelines')}</SelectItem>
        {Object.values(TimelineEnum).map((timeline) => (
          <SelectItem
            key={timeline}
            value={timeline}>
            {t(`Epic.Timeline.${timeline.toLowerCase()}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
