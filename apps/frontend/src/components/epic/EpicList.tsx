'use client';
import { EpicFilter, EpicFilterType } from '@/components/epic/EpicFilter';
import { EpicFormSheet } from '@/components/epic/EpicFormSheet';
import { EpicItem } from '@/components/epic/epic-item/EpicItem';

import { FiligranTimelineMapping } from '@/components/epic/epic-item/TimelineMapping';
import {
  useCountEpicsByProduct,
  useDraftAndTimelineEpics,
} from '@/components/epic/epic-list-utils';
import { PortalContext } from '@/components/me/AppPortalContext';
import { useAdminByPass } from '@/hooks/use-portal-capability';
import useServiceCapability from '@/hooks/use-service-capability';
import { DEBOUNCE_TIME } from '@/utils/constant';
import { APP_PATH } from '@/utils/path/constant';
import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@filigran/ui';
import { Separator } from '@filigran/ui/clients';
import { epic_fragment$data } from '@generated/epic_fragment.graphql';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import {
  OrganizationCapability,
  ServiceRestriction,
  Timeline,
} from '@graphql/generated';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useCallback, useContext, useMemo, useState } from 'react';
import { useDebounceCallback } from 'usehooks-ts';

interface EpicListProps {
  epics: epic_fragment$data[];
  serviceInstance:
    serviceInstance_fragment$data | seoServiceInstanceFragment$data;
  selectedProduct?: EpicFilterType;
  onFilterChange: (filter: EpicFilterType) => void;
  onSearch: (searchTerm: string) => void;
}

const isServiceInstanceWithSubscriptions = (
  instance: serviceInstance_fragment$data | seoServiceInstanceFragment$data
): instance is serviceInstance_fragment$data => 'subscriptions' in instance;

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
  const detailedServiceInstance = isServiceInstanceWithSubscriptions(
    serviceInstance
  )
    ? serviceInstance
    : undefined;

  const userCanUpdate = useServiceCapability(
    ServiceRestriction.Upsert,
    detailedServiceInstance
  );
  const userCanDelete = useServiceCapability(
    ServiceRestriction.Delete,
    detailedServiceInstance
  );
  const { me, hasOrganizationCapability } = useContext(PortalContext);

  const canManageService =
    useServiceCapability(
      ServiceRestriction.ManageAccess,
      detailedServiceInstance
    ) ||
    (hasOrganizationCapability &&
      (hasOrganizationCapability(
        OrganizationCapability.AdministrateOrganization
      ) ||
        hasOrganizationCapability(OrganizationCapability.ManageSubscription)));

  const isBypass = useAdminByPass();

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
      ...(showFinished ? [{ title: Timeline.Finished, epics: finished }] : []),
      { title: Timeline.Now, epics: now },
      { title: Timeline.Next, epics: next },
      { title: Timeline.UnderConsideration, epics: under_consideration },
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

  const currentSubscription = detailedServiceInstance?.subscriptions?.find(
    (sub) => sub?.organization_id === me?.selected_organization_id
  );

  return (
    <>
      <div className="flex m-s">
        <h1>{t('Epic.XTMRoadmap')}</h1>
        <div className="ml-auto flex items-center justify-center gap-s">
          {userCanUpdate && (
            <EpicFormSheet
              open={openSheet}
              setOpen={setOpenSheet}
            />
          )}
          {(canManageService || isBypass) && currentSubscription?.id && (
            <Button
              asChild
              variant="outline"
              className="">
              <Link
                href={`/${APP_PATH}/manage/service/${serviceInstance.id}/subscription/${currentSubscription.id}`}>
                {t('Service.Capabilities.ManageAccessName')}
              </Link>
            </Button>
          )}
        </div>
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
          FiligranTimelineMapping[timeline.title]?.color ?? 'white';

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
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p
                      className={`m-s inline-block font-semibold text-${timelineColor}`}>
                      {t(`Epic.Timeline.${timeline.title.toLowerCase()}`)}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    align="start">
                    {t(`Epic.Timeline.Details.${timeline.title.toLowerCase()}`)}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
