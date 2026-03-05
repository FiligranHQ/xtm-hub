import { epic_fragment$data } from '@generated/epic_fragment.graphql';
import { TimelineEnum } from '@generated/models/Timeline.enum';
import { useMemo } from 'react';
type Categories = 'draft' | TimelineEnum;
export function useDraftAndTimelineEpics(epics: epic_fragment$data[]) {
  return useMemo(() => {
    const initial: Record<Categories, epic_fragment$data[]> = {
      draft: [],
      now: [],
      next: [],
      under_consideration: [],
    };

    if (!epics) return initial;

    return epics.reduce((acc, item: epic_fragment$data) => {
      if (!item.active) acc.draft.push(item);
      else if (item.timeline === TimelineEnum.NOW) acc.now.push(item);
      else if (item.timeline === TimelineEnum.NEXT) acc.next.push(item);
      else if (item.timeline === TimelineEnum.UNDER_CONSIDERATION)
        acc.under_consideration.push(item);

      return acc;
    }, initial);
  }, [epics]);
}
