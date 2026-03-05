'use client';
import { EpicFilter, FilterType } from '@/components/epic/epic-filter';
import { EpicFormSheet } from '@/components/epic/epic-form-sheet';
import { EpicItem } from '@/components/epic/epic-item';
import {
  useCountEpicsByProduct,
  useDraftAndTimelineEpics,
} from '@/components/epic/epic-list-utils';
import { ServiceCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import useServiceCapability from '@/hooks/useServiceCapability';
import { Separator } from '@filigran/ui/clients';
import { epic_fragment$data } from '@generated/epic_fragment.graphql';
import { TimelineEnum } from '@generated/models/Timeline.enum';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface EpicListProps {
  epics: epic_fragment$data[];
  serviceInstance: serviceInstance_fragment$data;
  selectedProduct: FilterType;
  onFilterChange: (filter: FilterType) => void;
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
    serviceInstance
  );
  const userCanDelete = useServiceCapability(
    ServiceCapabilityName.Delete,
    serviceInstance
  );
  const filteredEpics =
    selectedProduct === 'all'
      ? epics
      : epics.filter((epic) => epic.product === selectedProduct);

  const { draft, now, next, under_consideration } =
    useDraftAndTimelineEpics(filteredEpics);
  const { xtmhub, opencti, openaev } = useCountEpicsByProduct(epics);

  const sections = [
    { title: 'draft', epics: draft },
    { title: TimelineEnum.NOW, epics: now },
    { title: TimelineEnum.NEXT, epics: next },
    { title: TimelineEnum.UNDER_CONSIDERATION, epics: under_consideration },
  ];

  const renderEpicItems = (epicsList: typeof epics) =>
    epicsList.map((epic) => (
      <EpicItem
        key={epic.id}
        epic={epic}
        serviceInstanceId={serviceInstance.id}
        userCanUpdate={userCanUpdate}
        userCanDelete={userCanDelete}
      />
    ));

  return (
    <>
      <div className="flex flex-row items-center gap-4">
        <h1>{t('Epic.XTMRoadmap')}</h1>
        {userCanUpdate && (
          <EpicFormSheet
            open={openSheet}
            setOpen={setOpenSheet}
          />
        )}
        <EpicFilter
          selectedFilter={selectedProduct}
          onSelectedFilterChange={onFilterChange}
          xtmhubCount={xtmhub.length}
          openctiCount={opencti.length}
          openaevCount={openaev.length}
        />
      </div>
      {sections.map((timeline) => {
        if (timeline.title === 'draft' && !(userCanUpdate || userCanDelete)) {
          return null;
        }
        return (
          <>
            {timeline.epics.length > 0 && (
              <div key={timeline.title}>
                <div
                  key={timeline.title}
                  className="relative flex items-center justify-center">
                  <Separator className="my-l absolute" />
                  <span className="relative bg-background p-s text-muted-foreground">
                    {t(`Epic.Timeline.${timeline.title.toUpperCase()}`)}
                  </span>
                </div>
                <ul
                  className={
                    'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-l'
                  }>
                  {renderEpicItems(timeline.epics)}
                </ul>
              </div>
            )}
          </>
        );
      })}
    </>
  );
};
