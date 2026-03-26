'use client';
import { EpicFilter, EpicFilterType } from '@/components/epic/epic-filter';
import { EpicFormSheet } from '@/components/epic/epic-form-sheet';
import { EpicItem } from '@/components/epic/epic-item/epic-item';
import {
  useCountEpicsByProduct,
  useDraftAndTimelineEpics,
} from '@/components/epic/epic-list-utils';
import { ServiceCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import useServiceCapability from '@/hooks/useServiceCapability';
import { Separator } from '@filigran/ui/clients';
import { epic_fragment$data } from '@generated/epic_fragment.graphql';
import { TimelineEnum } from '@generated/models/Timeline.enum';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';

interface EpicListProps {
  epics: epic_fragment$data[];
  serviceInstance:
    | serviceInstance_fragment$data
    | seoServiceInstanceFragment$data;
  selectedProduct: EpicFilterType;
  onFilterChange: (filter: EpicFilterType) => void;
}

export const EpicList = ({
  epics,
  serviceInstance,
  selectedProduct,
  onFilterChange,
}: EpicListProps) => {
  const t = useTranslations();
  const [openSheet, setOpenSheet] = useState(false);
  const userCanUpdate = useServiceCapability(
    ServiceCapabilityName.Upsert,
    serviceInstance as serviceInstance_fragment$data
  );
  const userCanDelete = useServiceCapability(
    ServiceCapabilityName.Delete,
    serviceInstance as serviceInstance_fragment$data
  );
  const filteredEpics =
    selectedProduct === 'all'
      ? epics
      : epics.filter((epic) => epic.product === selectedProduct);

  const { draft, now, next, under_consideration, finished } =
    useDraftAndTimelineEpics(filteredEpics);
  const countsByProduct = useCountEpicsByProduct(epics, userCanUpdate);

  const sections = useMemo(
    () => [
      { title: 'draft', epics: draft },
      { title: TimelineEnum.NOW, epics: now },
      { title: TimelineEnum.NEXT, epics: next },
      { title: TimelineEnum.UNDER_CONSIDERATION, epics: under_consideration },
      { title: TimelineEnum.FINISHED, epics: finished },
    ],
    [draft, now, next, under_consideration, finished]
  );

  const renderEpicItems = useCallback(
    (epicsList: typeof epics) =>
      epicsList.map((epic) => (
        <EpicItem
          key={epic.id}
          epic={epic}
          serviceInstanceId={serviceInstance.id}
          userCanUpdate={userCanUpdate}
          userCanDelete={userCanDelete}
        />
      )),
    [serviceInstance.id, userCanUpdate, userCanDelete]
  );

  return (
    <>
      <div className="flex flex-row items-center gap-4">
        <h1>{t('Epic.XTMRoadmap')}</h1>
        <div className="flex flex-row ml-auto items-center">
          <EpicFilter
            selectedFilter={selectedProduct}
            onSelectedFilterChange={onFilterChange}
            countsByProduct={countsByProduct}
          />
          {userCanUpdate && (
            <EpicFormSheet
              open={openSheet}
              setOpen={setOpenSheet}
            />
          )}
        </div>
      </div>
      {sections.map((timeline) => {
        if (
          (timeline.title === 'draft' && !(userCanUpdate || userCanDelete)) ||
          timeline.epics.length === 0
        ) {
          return null;
        }
        return (
          <div key={timeline.title}>
            <div className="relative my-xl">
              <Separator />
              <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-s text-muted-foreground">
                {t(`Epic.Timeline.${timeline.title.toLowerCase()}`)}
              </span>
            </div>
            <ul
              className={
                'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-l'
              }>
              {renderEpicItems(timeline.epics)}
            </ul>
          </div>
        );
      })}
    </>
  );
};
