'use client';
import {
  useCountEpicsByProduct,
  useDraftAndTimelineEpics,
} from '@/components/epic/epic-list-utils';
import { DEBOUNCE_TIME } from '@/utils/constant';
import { Separator } from '@filigran/ui/clients';
import { epic_fragment$data } from '@generated/epic_fragment.graphql';
import { TimelineEnum } from '@generated/models/Timeline.enum';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';
import { useDebounceCallback } from 'usehooks-ts';
import useServiceCapability from '../../hooks/use-service-capability';
import { ServiceCapabilityName } from '../service/[slug]/capabilities/Capability.helper';
import { EpicFilter, EpicFilterType } from './EpicFilter';
import { EpicFormSheet } from './EpicFormSheet';
import { EpicItem } from './epic-item/EpicItem';
import { FiligranTimelineMapping } from './epic-item/TimelineMapping';

interface EpicListProps {
  epics: epic_fragment$data[];
  serviceInstance:
    | serviceInstance_fragment$data
    | seoServiceInstanceFragment$data;
  selectedProduct?: EpicFilterType;
  onFilterChange: (filter: EpicFilterType) => void;
  onSearch: (searchTerm: string) => void;
}

export const EpicList = ({
  epics,
  serviceInstance,
  selectedProduct,
  onFilterChange,
  onSearch,
}: EpicListProps) => {
  const t = useTranslations();
  const [openSheet, setOpenSheet] = useState(false);
  const [showFinished, setShowFinished] = useState(false);
  const userCanUpdate = useServiceCapability(
    ServiceCapabilityName.Upsert,
    serviceInstance as serviceInstance_fragment$data
  );
  const userCanDelete = useServiceCapability(
    ServiceCapabilityName.Delete,
    serviceInstance as serviceInstance_fragment$data
  );
  const filteredEpics =
    !selectedProduct || selectedProduct === 'all'
      ? epics
      : epics.filter((epic) => epic.product === selectedProduct);

  const { draft, now, next, under_consideration, finished } =
    useDraftAndTimelineEpics(filteredEpics);
  const countsByProduct = useCountEpicsByProduct(
    epics,
    userCanUpdate,
    showFinished
  );

  const sections = useMemo(
    () => [
      { title: 'draft', epics: draft },
      ...(showFinished
        ? [{ title: TimelineEnum.FINISHED, epics: finished }]
        : []),
      { title: TimelineEnum.NOW, epics: now },
      { title: TimelineEnum.NEXT, epics: next },
      { title: TimelineEnum.UNDER_CONSIDERATION, epics: under_consideration },
    ],
    [draft, now, next, under_consideration, finished, showFinished]
  );

  const renderEpicItems = useCallback(
    (epicsList: typeof epics) =>
      epicsList.map((epic) => (
        <div key={epic.title}>
          <EpicItem
            key={epic.id}
            epic={epic}
            serviceInstanceId={serviceInstance.id}
            userCanUpdate={userCanUpdate}
            userCanDelete={userCanDelete}
          />
        </div>
      )),
    [serviceInstance.id, userCanUpdate, userCanDelete]
  );

  const handleInputChange = (inputValue: string) => {
    onSearch(inputValue);
  };

  const debounceHandleInput = useDebounceCallback(
    (e) => handleInputChange(e.target.value),
    DEBOUNCE_TIME
  );

  return (
    <>
      <div className="flex m-s">
        <h1>{t('Epic.XTMRoadmap')}</h1>
        {userCanUpdate && (
          <div className="ml-auto">
            <EpicFormSheet
              open={openSheet}
              setOpen={setOpenSheet}
            />
          </div>
        )}
      </div>
      <EpicFilter
        selectedFilter={selectedProduct}
        onSelectedFilterChange={onFilterChange}
        countsByProduct={countsByProduct}
        showFinished={showFinished}
        onShowFinishedChange={setShowFinished}
        debounceHandleInput={debounceHandleInput}
      />
      {sections.map((timeline) => {
        if (
          (timeline.title === 'draft' && !(userCanUpdate || userCanDelete)) ||
          timeline.epics.length === 0
        ) {
          return null;
        }
        const timelineColor =
          FiligranTimelineMapping[timeline.title as TimelineEnum]?.color ??
          'white';

        return (
          <div
            key={timeline.title}
            className="flex items-stretch gap-m">
            <div className="flex flex-col items-center self-stretch mt-xl">
              <div className="rounded-full w-6 h-6 flex items-center justify-center relative">
                <div
                  className={`absolute inset-0 bg-${timelineColor} opacity-30 rounded-full`}
                />
                <span
                  className={`relative z-10 font-semibold txt-mini text-${timelineColor}`}>
                  {timeline.epics.length}
                </span>
              </div>
              <Separator
                orientation="vertical"
                className={`mt-s flex-1 w-px bg-${timelineColor}`}
              />
            </div>
            <div className="flex-1 mt-l">
              <p className={`m-s font-semibold text-${timelineColor}`}>
                {t(`Epic.Timeline.${timeline.title.toLowerCase()}`)}
              </p>
              <ul
                className={
                  'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 gap-l'
                }>
                {renderEpicItems(timeline.epics)}
              </ul>
            </div>
          </div>
        );
      })}
    </>
  );
};
