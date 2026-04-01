import { epic_fragment$data } from '@generated/epic_fragment.graphql';
import { FiligranProductEnum } from '@generated/models/FiligranProduct.enum';
import { TimelineEnum } from '@generated/models/Timeline.enum';
import { useMemo } from 'react';
type Categories = 'draft' | TimelineEnum;

const isRecentlyFinished = (epic: epic_fragment$data): boolean => {
  const referenceDate = epic.updated_at ?? epic.created_at;
  if (!referenceDate) return false;

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  return new Date(referenceDate).getTime() > threeMonthsAgo.getTime();
};

export function useDraftAndTimelineEpics(epics: epic_fragment$data[]) {
  return useMemo(() => {
    const initial: Record<Categories, epic_fragment$data[]> = {
      draft: [],
      now: [],
      next: [],
      under_consideration: [],
      finished: [],
    };

    if (!epics) return initial;

    return epics.reduce((acc, item: epic_fragment$data) => {
      if (!item.active) acc.draft.push(item);
      else if (item.timeline === TimelineEnum.NOW) acc.now.push(item);
      else if (item.timeline === TimelineEnum.NEXT) acc.next.push(item);
      else if (item.timeline === TimelineEnum.UNDER_CONSIDERATION)
        acc.under_consideration.push(item);
      else if (
        item.timeline === TimelineEnum.FINISHED &&
        isRecentlyFinished(item)
      )
        acc.finished.push(item);

      return acc;
    }, initial);
  }, [epics]);
}
export function useCountEpicsByProduct(
  epics: epic_fragment$data[],
  userCanUpdate: boolean,
  showFinished: boolean
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

    const filteredEpics = epics.filter((epic) => {
      if (!userCanUpdate && !epic.active) return false;
      if (epic.timeline === TimelineEnum.FINISHED) {
        return showFinished && isRecentlyFinished(epic);
      }
      return true;
    });

    return filteredEpics.reduce((acc, item) => {
      acc[item.product] += 1;
      return acc;
    }, initial);
  }, [epics, userCanUpdate, showFinished]);
}
