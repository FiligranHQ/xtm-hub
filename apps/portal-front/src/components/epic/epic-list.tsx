'use client';
import { EpicFormSheet } from '@/components/epic/epic-form-sheet';
import { EpicItem } from '@/components/epic/epic-item';
import { ServiceCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import useServiceCapability from '@/hooks/useServiceCapability';
import { Separator } from '@filigran/ui/clients';
import { epic_fragment$data } from '@generated/epic_fragment.graphql';
import { TimelineEnum } from '@generated/models/Timeline.enum';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

interface EpicListProps {
  epics: epic_fragment$data[];
  serviceInstance: serviceInstance_fragment$data;
}

export const EpicList = ({ epics, serviceInstance }: EpicListProps) => {
  const t = useTranslations();
  const [openSheet, setOpenSheet] = useState(false);

  const userCanUpdate = useServiceCapability(
    ServiceCapabilityName.Upsert,
    serviceInstance
  );

  const epicItems = useMemo(
    () =>
      epics.map((epic) => (
        <EpicItem
          key={epic.id}
          epic={epic}
          serviceInstanceId={serviceInstance.id}
        />
      )),
    [epics, serviceInstance.id]
  );

  return (
    <>
      <div className="flex flex-row">
        <h1>{t('Epics.XTMRoadmap')}</h1>
        {userCanUpdate && (
          <EpicFormSheet
            open={openSheet}
            setOpen={setOpenSheet}
          />
        )}
      </div>
      <div className="relative flex items-center justify-center">
        <Separator className="my-l absolute" />
        <span className="relative bg-background p-s text-muted-foreground">
          {TimelineEnum.NOW}
        </span>
      </div>
      <ul
        className={
          'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-l'
        }>
        {epicItems}
      </ul>
    </>
  );
};
