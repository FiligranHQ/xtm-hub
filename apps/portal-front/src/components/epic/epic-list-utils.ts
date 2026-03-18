import { epic_fragment$data } from '@generated/epic_fragment.graphql';
import { FiligranProductEnum } from '@generated/models/FiligranProduct.enum';
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
export function useCountEpicsByProduct(
  epics: epic_fragment$data[],
  userCanUpdate: boolean
): Record<FiligranProductEnum, number> {
  return useMemo(() => {
    const initial = Object.values(FiligranProductEnum).reduce(
      (acc, product) => {
        acc[product] = 0;
        return acc;
      },
      {} as Record<FiligranProductEnum, number>
    );

    if (!epics) return initial;

    const filteredEpics = userCanUpdate
      ? epics
      : epics.filter((epic) => epic.active);

    return filteredEpics.reduce((acc, item) => {
      acc[item.product] += 1;
      return acc;
    }, initial);
  }, [epics, userCanUpdate]);
}
