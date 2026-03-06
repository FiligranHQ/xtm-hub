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
export function useCountEpicsByProduct(epics: epic_fragment$data[]) {
  return useMemo(() => {
    const initial: Record<FiligranProductEnum, epic_fragment$data[]> = {
      [FiligranProductEnum.XTMHUB]: [],
      [FiligranProductEnum.OPENCTI]: [],
      [FiligranProductEnum.OPENAEV]: [],
    };

    if (!epics) return initial;

    return epics.reduce((acc, item: epic_fragment$data) => {
      if (item.product === FiligranProductEnum.XTMHUB)
        acc[FiligranProductEnum.XTMHUB].push(item);
      else if (item.product === FiligranProductEnum.OPENCTI)
        acc[FiligranProductEnum.OPENCTI].push(item);
      else if (item.product === FiligranProductEnum.OPENAEV)
        acc[FiligranProductEnum.OPENAEV].push(item);

      return acc;
    }, initial);
  }, [epics]);
}
